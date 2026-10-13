import mongoose from "/Users/Windows/Desktop/Eduverse/backend/node_modules/mongoose/index.js";
import dotenv from "/Users/Windows/Desktop/Eduverse/backend/node_modules/dotenv/lib/main.js";
import jwt from "/Users/Windows/Desktop/Eduverse/backend/node_modules/jsonwebtoken/index.js";
import { io } from "/Users/Windows/Desktop/Eduverse/frontend/node_modules/socket.io-client/build/esm/index.js";

dotenv.config({ path: "/Users/Windows/Desktop/Eduverse/backend/.env" });

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const API_BASE = "http://localhost:5001/api";
const SOCKET_URL = "http://localhost:5001";

async function runE2ETests() {
  console.log("=== RUNNING COMPLETE NOTIFICATIONS & SESSIONS VERIFICATION ===");

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

  const course = await courses.findOne({ mentor: mentor._id, status: "published" }) || await courses.findOne({ mentor: mentor._id });
  if (!course) {
    throw new Error("No course found for mentor.");
  }

  console.log(`Mentor: ${mentor.name} (${mentor.email})`);
  console.log(`Student: ${student.name} (${student.email})`);
  console.log(`Course: "${course.title}" [ID: ${course._id}]`);

  // Reset student enrollment for this course
  await enrollments.deleteMany({ student: student._id, course: course._id });

  // 1. Create active sessions for Mentor and Student
  const mentorSession = await sessions.insertOne({
    user: mentor._id,
    device: "Desktop",
    browser: "Google Chrome",
    os: "macOS",
    ipAddress: "127.0.0.1",
    lastActive: new Date(),
    expiresAt: new Date(Date.now() + 7 * 86400000),
    isActive: true,
    createdAt: new Date(),
  });

  const studentSession = await sessions.insertOne({
    user: student._id,
    device: "Desktop",
    browser: "Google Chrome",
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

  // -----------------------------------------------------------------
  // 2. CONNECT SOCKETS
  // -----------------------------------------------------------------
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

  console.log("Both Mentor and Student sockets connected successfully.");

  // -----------------------------------------------------------------
  // 3. TEST ENROLLMENT -> TEACHER REAL-TIME NOTIFICATION
  // -----------------------------------------------------------------
  console.log("\n-> Testing Enrollment Real-Time Notification to Teacher...");

  let mentorReceivedEnrollmentNotif = null;
  const notifPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timeout: Mentor did not receive notification within 5s")), 5000);
    mentorSocket.on("new_notification", (notif) => {
      clearTimeout(timeout);
      resolve(notif);
    });
  });

  const enrollRes = await fetch(`${API_BASE}/enrollments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({ courseId: String(course._id) }),
  });
  const enrollData = await enrollRes.json();

  if (enrollRes.status !== 201) {
    throw new Error(`Enrollment failed: ${JSON.stringify(enrollData)}`);
  }

  mentorReceivedEnrollmentNotif = await notifPromise;
  console.log(" Mentor received live notification:");
  console.log(`   Type: ${mentorReceivedEnrollmentNotif.type}`);
  console.log(`   Message: "${mentorReceivedEnrollmentNotif.message}"`);
  console.log(`   Course: "${mentorReceivedEnrollmentNotif.course?.title}"`);

  // Verify mentor can fetch notification via REST
  const mentorNotifsRes = await fetch(`${API_BASE}/notifications?role=mentor`, {
    headers: { Authorization: `Bearer ${mentorToken}` },
  });
  const mentorNotifsData = await mentorNotifsRes.json();
  console.log(`Mentor unread count via REST: ${mentorNotifsData.unreadCount}`);

  if (mentorNotifsData.unreadCount < 1) {
    throw new Error("Mentor unreadCount should be >= 1");
  }

  // -----------------------------------------------------------------
  // 4. TEST REAL-TIME MESSAGE NOTIFICATION
  // -----------------------------------------------------------------
  console.log("\n-> Testing Real-Time Message Notification Broadcast...");

  // Student sends message to course group chat
  const convRes = await fetch(`${API_BASE}/messaging/conversations`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const convData = await convRes.json();
  const courseConv = convData.conversations?.find((c) => c.type === "course" && String(c.course?._id) === String(course._id));

  if (!courseConv) {
    throw new Error("Course conversation not found for enrolled course.");
  }

  let mentorReceivedMessage = null;
  const messagePromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timeout waiting for new_message on mentor socket")), 5000);
    mentorSocket.on("new_message", (msg) => {
      clearTimeout(timeout);
      resolve(msg);
    });
  });

  const testMsg = `Real-time message test ${Date.now()}`;
  studentSocket.emit("send_message", {
    conversationId: String(courseConv._id),
    content: testMsg,
  });

  mentorReceivedMessage = await messagePromise;
  console.log(" Mentor received live new_message notification:");
  console.log(`   Sender: ${mentorReceivedMessage.sender?.name}`);
  console.log(`   Content: "${mentorReceivedMessage.content}"`);

  // -----------------------------------------------------------------
  // 5. TEST SESSION MANAGEMENT & LOGOUT FROM ALL OTHER DEVICES
  // -----------------------------------------------------------------
  console.log("\n-> Testing Session Management & Multi-Device Logout...");

  // Create two extra sessions for Student
  const phoneSession = await sessions.insertOne({
    user: student._id,
    device: "Mobile",
    browser: "Safari",
    os: "iOS",
    ipAddress: "192.168.1.100",
    lastActive: new Date(),
    expiresAt: new Date(Date.now() + 7 * 86400000),
    isActive: true,
    createdAt: new Date(),
  });

  const tabletSession = await sessions.insertOne({
    user: student._id,
    device: "Tablet",
    browser: "Chrome",
    os: "Android",
    ipAddress: "192.168.1.101",
    lastActive: new Date(),
    expiresAt: new Date(Date.now() + 7 * 86400000),
    isActive: true,
    createdAt: new Date(),
  });

  const phoneToken = jwt.sign(
    { id: String(student._id), sessionId: String(phoneSession.insertedId) },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  // Student fetches sessions
  const sListRes = await fetch(`${API_BASE}/auth/sessions`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const sListData = await sListRes.json();
  console.log(`Student active sessions count before revocation: ${sListData.sessions?.length}`);

  // Revoke all other sessions from Student's primary device
  const revokeOtherRes = await fetch(`${API_BASE}/auth/sessions`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const revokeOtherData = await revokeOtherRes.json();
  console.log(`Revoke other sessions result:`, revokeOtherData.message);

  // Check that phoneToken is now REJECTED with 401
  const phoneCheckRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${phoneToken}` },
  });
  console.log(`Revoked phone session access attempt (expect 401): ${phoneCheckRes.status}`);

  // Check that primary studentToken is still VALID (200)
  const primaryCheckRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  console.log(`Primary desktop session access attempt (expect 200): ${primaryCheckRes.status}`);

  if (phoneCheckRes.status !== 401 || primaryCheckRes.status !== 200) {
    throw new Error("Session multi-device revocation enforcement failed!");
  }

  // Disconnect sockets
  mentorSocket.disconnect();
  studentSocket.disconnect();
  await mongoose.disconnect();

  console.log("\n=======================================================");
  console.log(" ALL REAL-TIME NOTIFICATIONS & SESSION MANAGEMENT TESTS");
  console.log(" PASSED WITH 100% ACCURACY!");
  console.log("=======================================================");
}

runE2ETests().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
