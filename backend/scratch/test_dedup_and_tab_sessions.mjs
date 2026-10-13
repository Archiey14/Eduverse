import mongoose from "/Users/Windows/Desktop/Eduverse/backend/node_modules/mongoose/index.js";
import dotenv from "/Users/Windows/Desktop/Eduverse/backend/node_modules/dotenv/lib/main.js";
import jwt from "/Users/Windows/Desktop/Eduverse/backend/node_modules/jsonwebtoken/index.js";
import { io } from "/Users/Windows/Desktop/Eduverse/frontend/node_modules/socket.io-client/build/esm/index.js";

dotenv.config({ path: "/Users/Windows/Desktop/Eduverse/backend/.env" });

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const API_BASE = "http://localhost:5001/api";
const SOCKET_URL = "http://localhost:5001";

async function runDedupTests() {
  console.log("=== VERIFYING DEDUPLICATION & MULTI-ACCOUNT ISOLATION ===");

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const users = db.collection("users");
  const courses = db.collection("courses");
  const sessions = db.collection("sessions");
  const enrollments = db.collection("enrollments");

  const mentor = await users.findOne({ email: "instructor@eduverse.com" });
  const student = await users.findOne({ email: "student@eduverse.com" });

  if (!mentor || !student) {
    throw new Error("Could not find mentor or student.");
  }

  const course =
    (await courses.findOne({ mentor: mentor._id, status: "published" })) ||
    (await courses.findOne({ mentor: mentor._id }));
  if (!course) {
    throw new Error("No course found for mentor.");
  }

  // Clear previous enrollment so student can enroll fresh
  await enrollments.deleteMany({ student: student._id, course: course._id });

  // 1. Create sessions for both accounts
  const mentorSession = await sessions.insertOne({
    user: mentor._id,
    device: "Desktop - Tab 1 (Instructor)",
    browser: "Chrome",
    os: "macOS",
    ipAddress: "127.0.0.1",
    lastActive: new Date(),
    expiresAt: new Date(Date.now() + 7 * 86400000),
    isActive: true,
    createdAt: new Date(),
  });

  const studentSession = await sessions.insertOne({
    user: student._id,
    device: "Desktop - Tab 2 (Student)",
    browser: "Chrome",
    os: "macOS",
    ipAddress: "127.0.0.1",
    lastActive: new Date(),
    expiresAt: new Date(Date.now() + 7 * 86400000),
    isActive: true,
    createdAt: new Date(),
  });

  const mentorToken = jwt.sign(
    { id: String(mentor._id), sessionId: String(mentorSession.insertedId) },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  const studentToken = jwt.sign(
    { id: String(student._id), sessionId: String(studentSession.insertedId) },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  // 2. Connect Sockets representing Tab 1 (Mentor) and Tab 2 (Student)
  const mentorSocket = io(SOCKET_URL, {
    auth: { token: mentorToken },
    transports: ["websocket"],
  });

  const studentSocket = io(SOCKET_URL, {
    auth: { token: studentToken },
    transports: ["websocket"],
  });

  await Promise.all([
    new Promise((res) => mentorSocket.on("connect", res)),
    new Promise((res) => studentSocket.on("connect", res)),
  ]);

  console.log("✓ Tab 1 (Mentor Socket) & Tab 2 (Student Socket) connected separately.");

  // -------------------------------------------------------------
  // TEST 1: Exactly ONE notification delivered on enrollment
  // -------------------------------------------------------------
  console.log("\n-> Test 1: Testing enrollment notification count on mentor socket...");
  let mentorNotifCount = 0;
  const receivedNotifs = [];

  mentorSocket.on("new_notification", (notif) => {
    mentorNotifCount++;
    receivedNotifs.push(notif);
  });

  const enrollRes = await fetch(`${API_BASE}/enrollments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({ courseId: String(course._id) }),
  });

  if (enrollRes.status !== 201) {
    throw new Error(`Enrollment failed with status ${enrollRes.status}`);
  }

  // Wait 1.5 seconds to see if any duplicate notification arrives
  await new Promise((res) => setTimeout(res, 1500));

  console.log(`Notifications received on Mentor socket: ${mentorNotifCount}`);
  if (mentorNotifCount !== 1) {
    throw new Error(`Expected exactly 1 notification, but got ${mentorNotifCount}! Duplicate notification detected!`);
  }
  console.log("✓ PASS: Mentor received exactly 1 enrollment notification (no duplicates)!");

  // -------------------------------------------------------------
  // TEST 2: Message deduplication across conversation room + user room
  // -------------------------------------------------------------
  console.log("\n-> Test 2: Testing new_message delivery deduplication...");

  // Get course conversation
  const convRes = await fetch(`${API_BASE}/messaging/conversations`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const convData = await convRes.json();
  const courseConv = convData.conversations?.find(
    (c) => c.type === "course" && String(c.course?._id) === String(course._id)
  );

  if (!courseConv) {
    throw new Error("Could not find course conversation.");
  }

  // Explicitly join conversation room on mentor socket as well
  await new Promise((res) => {
    mentorSocket.emit("join_conversation", { conversationId: String(courseConv._id) }, res);
  });

  let mentorMessageCount = 0;
  const receivedMessages = [];

  mentorSocket.on("new_message", (msg) => {
    mentorMessageCount++;
    receivedMessages.push(msg);
  });

  const msgContent = `Dedup test message ${Date.now()}`;
  studentSocket.emit("send_message", {
    conversationId: String(courseConv._id),
    content: msgContent,
  });

  // Wait 1.5 seconds to catch any duplicate message events
  await new Promise((res) => setTimeout(res, 1500));

  console.log(`Messages received on Mentor socket: ${mentorMessageCount}`);
  if (mentorMessageCount !== 1) {
    throw new Error(`Expected exactly 1 message event, but got ${mentorMessageCount}! Duplicate message event detected!`);
  }
  console.log("✓ PASS: Mentor received exactly 1 message event (no duplicates)!");

  // -------------------------------------------------------------
  // TEST 3: Multi-tab identity separation
  // -------------------------------------------------------------
  console.log("\n-> Test 3: Verifying Tab 1 and Tab 2 user separation...");
  const mentorMeRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${mentorToken}` },
  });
  const mentorMe = await mentorMeRes.json();

  const studentMeRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const studentMe = await studentMeRes.json();

  const mentorId = mentorMe.user?.id || mentorMe.user?._id;
  const studentId = studentMe.user?.id || studentMe.user?._id;

  console.log(`Tab 1 /auth/me returns: ${mentorMe.user?.name} [${mentorId}]`);
  console.log(`Tab 2 /auth/me returns: ${studentMe.user?.name} [${studentId}]`);

  if (!mentorId || !studentId || String(mentorId) === String(studentId)) {
    throw new Error("Identity conflict: Both sessions return the same user ID or missing ID!");
  }
  console.log("✓ PASS: Tab 1 and Tab 2 maintain strictly distinct identities!");

  mentorSocket.disconnect();
  studentSocket.disconnect();
  await mongoose.disconnect();

  console.log("\n=======================================================");
  console.log(" ALL TESTS PASSED: 0 DUPLICATES & FULL TAB ISOLATION! ");
  console.log("=======================================================");
}

runDedupTests().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
