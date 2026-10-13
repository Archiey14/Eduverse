import mongoose from "/Users/Windows/Desktop/Eduverse/backend/node_modules/mongoose/index.js";
import dotenv from "/Users/Windows/Desktop/Eduverse/backend/node_modules/dotenv/lib/main.js";
import jwt from "/Users/Windows/Desktop/Eduverse/backend/node_modules/jsonwebtoken/index.js";
import { io } from "/Users/Windows/Desktop/Eduverse/frontend/node_modules/socket.io-client/build/esm/index.js";
import fs from "node:fs";

dotenv.config({ path: "/Users/Windows/Desktop/Eduverse/backend/.env" });

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const API_BASE = "http://localhost:5001/api";
const SOCKET_URL = "http://localhost:5001";

async function runTest() {
  console.log("=== STARTING VERIFICATION: CHAT ATTACHMENTS & MESSAGE REACTIONS ===");

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const users = db.collection("users");
  const conversations = db.collection("conversations");
  const messages = db.collection("messages");

  const mentor = await users.findOne({ email: "instructor@eduverse.com" });
  const student = await users.findOne({ email: "student@eduverse.com" });

  if (!mentor || !student) {
    throw new Error("Could not find mentor or student user.");
  }

  // Generate tokens
  const mentorToken = jwt.sign(
    { id: mentor._id.toString(), role: mentor.roles?.[0] || "instructor" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  const studentToken = jwt.sign(
    { id: student._id.toString(), role: student.roles?.[0] || "student" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Find or create direct conversation between mentor and student
  let conv = await conversations.findOne({
    type: "direct",
    participants: { $all: [mentor._id, student._id] },
  });

  if (!conv) {
    const res = await conversations.insertOne({
      type: "direct",
      participants: [mentor._id, student._id],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    conv = await conversations.findOne({ _id: res.insertedId });
  }

  const convId = conv._id.toString();
  console.log(`[Test] Using Conversation ID: ${convId}`);

  // Connect sockets
  console.log("[Test] Connecting Mentor & Student sockets...");
  const mentorSocket = io(SOCKET_URL, {
    auth: { token: mentorToken },
    transports: ["websocket"],
  });

  const studentSocket = io(SOCKET_URL, {
    auth: { token: studentToken },
    transports: ["websocket"],
  });

  await Promise.all([
    new Promise((resolve) => mentorSocket.on("connect", resolve)),
    new Promise((resolve) => studentSocket.on("connect", resolve)),
  ]);
  console.log("[Test] Both sockets connected successfully.");

  // Both join conversation room
  await Promise.all([
    new Promise((resolve) =>
      mentorSocket.emit("join_conversation", { conversationId: convId }, resolve)
    ),
    new Promise((resolve) =>
      studentSocket.emit("join_conversation", { conversationId: convId }, resolve)
    ),
  ]);
  console.log("[Test] Both sockets joined conversation room.");

  // Set up listeners for real-time messages and reactions
  const studentReceivedMessages = [];
  studentSocket.on("new_message", (msg) => {
    studentReceivedMessages.push(msg);
  });

  const mentorReactionUpdates = [];
  mentorSocket.on("message_reactions_updated", (update) => {
    mentorReactionUpdates.push(update);
  });

  const studentReactionUpdates = [];
  studentSocket.on("message_reactions_updated", (update) => {
    studentReactionUpdates.push(update);
  });

  // ==========================================
  // TEST 1A: SINGLE FILE UPLOAD WITH CAPTION (NO DUPLICATION)
  // ==========================================
  console.log("\n--- TEST 1A: Single File Upload With Caption (Deduplication Check) ---");

  const singleContent = "Single NOC file content.";
  const singleBlob = new Blob([singleContent], { type: "application/pdf" });

  const singleFormData = new FormData();
  singleFormData.append("files", singleBlob, "Archie NOC.pdf");
  singleFormData.append("content", "Noc");

  const singleBeforeCount = studentReceivedMessages.length;

  const singleUploadRes = await fetch(`${API_BASE}/messaging/conversations/${convId}/attachments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${mentorToken}`,
    },
    body: singleFormData,
  });

  const singleUploadJson = await singleUploadRes.json();
  console.log("[Single Upload Status]:", singleUploadRes.status);
  console.log("[Single Upload Success]:", singleUploadJson.success);

  if (singleUploadRes.status !== 201 || !singleUploadJson.success) {
    throw new Error(`Single upload failed: ${JSON.stringify(singleUploadJson)}`);
  }

  const singleMessages = singleUploadJson.data || singleUploadJson.messages;
  if (!Array.isArray(singleMessages) || singleMessages.length !== 1) {
    throw new Error(`CRITICAL: Single file upload created ${singleMessages?.length} messages instead of 1!`);
  }

  console.log("[Verification] Exactly 1 message created for single file upload (0 duplicates)!");
  console.log("[Message Caption]:", singleMessages[0].content);
  console.log("[Message File]:", singleMessages[0].attachment.fileName);

  await new Promise((r) => setTimeout(r, 200));
  const singleAfterCount = studentReceivedMessages.length;
  if (singleAfterCount - singleBeforeCount !== 1) {
    throw new Error(`Expected exactly 1 socket new_message event for single file, received ${singleAfterCount - singleBeforeCount}!`);
  }
  console.log("[Verification] Exactly 1 socket event received by student!");

  // ==========================================
  // TEST 1B: MULTIPLE FILE UPLOAD WITH CAPTION
  // ==========================================
  console.log("\n--- TEST 1B: Multiple File Upload With Caption ---");

  // Create temporary test files
  const file1Content = "Sample notes for students from mentor.";
  const file1Blob = new Blob([file1Content], { type: "text/plain" });

  const file2Content = "Binary dummy content for syllabus.";
  const file2Blob = new Blob([file2Content], { type: "text/plain" });

  const formData = new FormData();
  formData.append("files", file1Blob, "notes.txt");
  formData.append("files", file2Blob, "syllabus.txt");
  formData.append("content", "Here are the weekly notes and syllabus files.");

  const uploadRes = await fetch(`${API_BASE}/messaging/conversations/${convId}/attachments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${mentorToken}`,
    },
    body: formData,
  });

  const uploadJson = await uploadRes.json();
  console.log("[Upload Response Status]:", uploadRes.status);
  console.log("[Upload Response Success]:", uploadJson.success);

  if (uploadRes.status !== 201 || !uploadJson.success) {
    throw new Error(`Upload failed: ${JSON.stringify(uploadJson)}`);
  }

  const uploadedMessages = uploadJson.data || uploadJson.messages;
  if (!Array.isArray(uploadedMessages) || uploadedMessages.length !== 2) {
    throw new Error(`Expected 2 uploaded messages, received ${uploadedMessages?.length}`);
  }

  console.log("[Verification] 2 File messages created successfully!");
  console.log("[Message 1 Caption]:", uploadedMessages[0].content);
  console.log("[Message 1 File]:", uploadedMessages[0].attachment.fileName);
  console.log("[Message 2 Caption]:", uploadedMessages[1].content);
  console.log("[Message 2 File]:", uploadedMessages[1].attachment.fileName);

  if (uploadedMessages[0].content !== "Here are the weekly notes and syllabus files.") {
    throw new Error("Caption was not attached to the first file message!");
  }

  // Test downloading the first attachment as student
  const targetMessageId = uploadedMessages[0]._id.toString();
  const downloadRes = await fetch(`${API_BASE}/messaging/attachments/${targetMessageId}/download`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  console.log("[Download Status]:", downloadRes.status);
  const downloadedText = await downloadRes.text();
  if (downloadRes.status !== 200 || downloadedText !== file1Content) {
    throw new Error("Downloaded attachment content did not match uploaded content!");
  }
  console.log("[Verification] File download authorized and content verified 100%!");

  // ==========================================
  // TEST 2: MESSAGE REACTIONS (ADD, SWITCH, REMOVE)
  // ==========================================
  console.log("\n--- TEST 2: Message Reactions Real-Time Flow ---");

  // Step 2A: Student adds 👍 reaction
  console.log("[Action] Student reacts 👍 to message:", targetMessageId);
  const addReactionResult1 = await new Promise((resolve) => {
    studentSocket.emit(
      "add_reaction",
      {
        conversationId: convId,
        messageId: targetMessageId,
        emoji: "👍",
      },
      resolve
    );
  });

  console.log("[Add Reaction 1 Result]:", addReactionResult1);
  if (!addReactionResult1?.ok) {
    throw new Error(`Add reaction failed: ${addReactionResult1?.error}`);
  }

  await new Promise((r) => setTimeout(r, 200));

  console.log("[Verification] Mentor received reaction update event:", mentorReactionUpdates.length);
  if (mentorReactionUpdates.length === 0) {
    throw new Error("Mentor socket did not receive message_reactions_updated event!");
  }

  const latestMentorUpdate = mentorReactionUpdates[mentorReactionUpdates.length - 1];
  console.log("[Mentor Update Reactions]:", latestMentorUpdate.reactions);
  if (
    !latestMentorUpdate.reactions.some(
      (r) => r.emoji === "👍" && (r.user._id?.toString() === student._id.toString() || r.user.toString() === student._id.toString())
    )
  ) {
    throw new Error("Reaction was not found in socket update broadcast!");
  }

  // Step 2B: Student updates reaction to 🔥
  console.log("[Action] Student changes reaction to 🔥");
  const addReactionResult2 = await new Promise((resolve) => {
    studentSocket.emit(
      "add_reaction",
      {
        conversationId: convId,
        messageId: targetMessageId,
        emoji: "🔥",
      },
      resolve
    );
  });

  if (!addReactionResult2?.ok) {
    throw new Error(`Change reaction failed: ${addReactionResult2?.error}`);
  }

  await new Promise((r) => setTimeout(r, 200));

  // Check DB directly
  const dbMsg = await messages.findOne({ _id: new mongoose.Types.ObjectId(targetMessageId) });
  console.log("[DB Reactions Count]:", dbMsg.reactions.length);
  if (dbMsg.reactions.length !== 1 || dbMsg.reactions[0].emoji !== "🔥") {
    throw new Error(`Expected exactly 1 reaction (🔥), found: ${JSON.stringify(dbMsg.reactions)}`);
  }
  console.log("[Verification] One reaction per user enforced, updated to 🔥 cleanly!");

  // Step 2C: Mentor also reacts with 🎉
  console.log("[Action] Mentor reacts with 🎉");
  const mentorAddRes = await new Promise((resolve) => {
    mentorSocket.emit(
      "add_reaction",
      {
        conversationId: convId,
        messageId: targetMessageId,
        emoji: "🎉",
      },
      resolve
    );
  });

  if (!mentorAddRes?.ok) {
    throw new Error(`Mentor add reaction failed: ${mentorAddRes?.error}`);
  }

  await new Promise((r) => setTimeout(r, 200));

  const dbMsg2 = await messages.findOne({ _id: new mongoose.Types.ObjectId(targetMessageId) });
  console.log("[DB Reactions Count with both users]:", dbMsg2.reactions.length);
  if (dbMsg2.reactions.length !== 2) {
    throw new Error(`Expected 2 reactions, found: ${dbMsg2.reactions.length}`);
  }
  console.log("[Verification] Multiple users can react concurrently!");

  // Step 2D: Student removes their reaction
  console.log("[Action] Student removes their reaction");
  const removeRes1 = await new Promise((resolve) => {
    studentSocket.emit(
      "remove_reaction",
      {
        conversationId: convId,
        messageId: targetMessageId,
      },
      resolve
    );
  });

  if (!removeRes1?.ok) {
    throw new Error(`Remove reaction failed: ${removeRes1?.error}`);
  }

  await new Promise((r) => setTimeout(r, 200));

  const dbMsg3 = await messages.findOne({ _id: new mongoose.Types.ObjectId(targetMessageId) });
  console.log("[DB Reactions Count after student removal]:", dbMsg3.reactions.length);
  if (
    dbMsg3.reactions.length !== 1 ||
    dbMsg3.reactions[0].emoji !== "🎉" ||
    dbMsg3.reactions[0].user.toString() !== mentor._id.toString()
  ) {
    throw new Error(`Student reaction removal failed or removed mentor's reaction!`);
  }
  console.log("[Verification] Student reaction removed successfully, mentor reaction preserved!");

  // Step 2E: Mentor removes their reaction
  console.log("[Action] Mentor removes their reaction");
  const removeRes2 = await new Promise((resolve) => {
    mentorSocket.emit(
      "remove_reaction",
      {
        conversationId: convId,
        messageId: targetMessageId,
      },
      resolve
    );
  });

  if (!removeRes2?.ok) {
    throw new Error(`Mentor remove reaction failed: ${removeRes2?.error}`);
  }

  await new Promise((r) => setTimeout(r, 200));

  const dbMsg4 = await messages.findOne({ _id: new mongoose.Types.ObjectId(targetMessageId) });
  console.log("[DB Reactions Count after both removed]:", dbMsg4.reactions.length);
  if (dbMsg4.reactions.length !== 0) {
    throw new Error(`Expected 0 reactions, found: ${dbMsg4.reactions.length}`);
  }
  console.log("[Verification] All reactions removed cleanly!");

  // Cleanup sockets & connection
  mentorSocket.disconnect();
  studentSocket.disconnect();
  await mongoose.disconnect();

  console.log("\n========================================================");
  console.log("ALL TESTS PASSED 100% SUCCESSFULLY!");
  console.log("1. Multi-file upload with staging & caption: PASSED");
  console.log("2. Private attachment security & download: PASSED");
  console.log("3. Real-time message reactions (add/update/remove): PASSED");
  console.log("========================================================\n");
}

runTest().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
