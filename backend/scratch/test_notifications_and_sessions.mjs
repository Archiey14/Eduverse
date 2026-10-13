import mongoose from "/Users/Windows/Desktop/Eduverse/backend/node_modules/mongoose/index.js";
import dotenv from "/Users/Windows/Desktop/Eduverse/backend/node_modules/dotenv/lib/main.js";
import jwt from "/Users/Windows/Desktop/Eduverse/backend/node_modules/jsonwebtoken/index.js";
import { io } from "/Users/Windows/Desktop/Eduverse/frontend/node_modules/socket.io-client/build/esm/index.js";

dotenv.config({ path: "/Users/Windows/Desktop/Eduverse/backend/.env" });

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const API_BASE = "http://localhost:5001/api";
const SOCKET_URL = "http://localhost:5001";

async function runTests() {
  console.log("=== TESTING REAL-TIME NOTIFICATIONS & SESSION MANAGEMENT ===");

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const users = db.collection("users");
  const courses = db.collection("courses");
  const sessions = db.collection("sessions");
  const enrollments = db.collection("enrollments");

  // Find a mentor and a course
  const mentor = await users.findOne({ email: "instructor@eduverse.com" });
  if (!mentor) throw new Error("Mentor not found");

  const course = await courses.findOne({ mentor: mentor._id, status: "published" }) || await courses.findOne({ mentor: mentor._id });
  if (!course) throw new Error("Course not found for mentor");

  // Find a student who is NOT currently enrolled in this course
  const enrolledStudentIds = (await enrollments.find({ course: course._id }).toArray()).map((e) => String(e.student));
  
  let student = await users.findOne({
    _id: { $nin: [mentor._id, ...enrolledStudentIds.map((id) => new mongoose.Types.ObjectId(id))] },
    isActive: true,
  });

  if (!student) {
    // Pick an existing student and remove enrollment for testing
    student = await users.findOne({ email: "student@eduverse.com" });
    await enrollments.deleteMany({ student: student._id, course: course._id });
    console.log("Cleaned previous test enrollment for student");
  }

  console.log(`Mentor: ${mentor.name} (${mentor.email})`);
  console.log(`Course: "${course.title}"`);
  console.log(`Student: ${student.name} (${student.email})`);

  // -------------------------------------------------------------
  // TEST 1: SESSION CREATION & VERIFICATION
  // -------------------------------------------------------------
  console.log("\n--- TEST 1: Session Tracking & Listing ---");
  
  // Create a session for mentor in DB
  const mentorSession = await db.collection("sessions").insertOne({
    user: mentor._id,
    device: "Desktop",
    browser: "Google Chrome",
    os: "macOS",
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
    lastActive: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    isActive: true,
    createdAt: new Date(),
  });

  const mentorToken = jwt.sign(
    { id: String(mentor._id), sessionId: String(mentorSession.insertedId) },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  const sessionsRes = await fetch(`${API_BASE}/auth/sessions`, {
    headers: { Authorization: `Bearer ${mentorToken}` },
  });
  const sessionsData = await sessionsRes.json();

  console.log(`GET /api/auth/sessions status: ${sessionsRes.status}, count: ${sessionsData.sessions?.length}`);
  const currentSession = sessionsData.sessions?.find((s) => s._id === String(mentorSession.insertedId));
  console.log(`Current session found & isCurrent == true:`, currentSession?.isCurrent === true);

  if (sessionsRes.status !== 200 || !currentSession || !currentSession.isCurrent) {
    throw new Error("Session listing test failed!");
  }
  console.log(" PASS: Session tracking and retrieval working accurately.");

  // -------------------------------------------------------------
  // TEST 2: SESSION REVOCATION & SECURITY
  // -------------------------------------------------------------
  console.log("\n--- TEST 2: Session Revocation & Enforcement ---");

  // Create another dummy session
  const secondSession = await db.collection("sessions").insertOne({
    user: mentor._id,
    device: "Mobile",
    browser: "Mobile Safari",
    os: "iOS",
    ipAddress: "192.168.1.50",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    lastActive: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    isActive: true,
    createdAt: new Date(),
  });

  const secondToken = jwt.sign(
    { id: String(mentor._id), sessionId: String(secondSession.insertedId) },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  // Revoke second session using mentor's main session
  const revokeRes = await fetch(`${API_BASE}/auth/sessions/${secondSession.insertedId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${mentorToken}` },
  });
  const revokeData = await revokeRes.json();
  console.log(`DELETE /api/auth/sessions/:id status: ${revokeRes.status}, message: ${revokeData.message}`);

  // Now, try accessing /api/auth/me with secondToken -> MUST return 401
  const testRevokedRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${secondToken}` },
  });
  console.log(`Revoked session access attempt (expect 401): ${testRevokedRes.status}`);

  if (revokeRes.status !== 200 || testRevokedRes.status !== 401) {
    throw new Error("Session revocation security enforcement failed!");
  }
  console.log(" PASS: Session revocation blocks subsequent requests immediately.");

  // -------------------------------------------------------------
  // TEST 3: REAL-TIME ENROLLMENT NOTIFICATION TO TEACHER
  // -------------------------------------------------------------
  console.log("\n--- TEST 3: Real-Time Enrollment Notification to Mentor ---");

  // Connect Mentor via Socket.IO
  const mentorSocket = io(SOCKET_URL, {
    auth: { token: mentorToken },
    transports: ["websocket"],
  });

  await new Promise((resolve, reject) => {
    mentorSocket.on("connect", resolve);
    mentorSocket.on("connect_error", reject);
  });
  console.log("Mentor connected to Socket.IO.");

  // Listen for real-time `new_notification`
  let receivedNotification = null;
  const notifPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timeout: Mentor did not receive notification within 5s")), 5000);
    mentorSocket.on("new_notification", (notif) => {
      clearTimeout(timeout);
      resolve(notif);
    });
  });

  // Student enrolls in course
  const studentToken = jwt.sign({ id: String(student._id) }, JWT_SECRET, { expiresIn: "1d" });
  console.log(`Student enrolling in course "${course.title}"...`);

  const enrollRes = await fetch(`${API_BASE}/enrollments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({ courseId: String(course._id) }),
  });
  const enrollData = await enrollRes.json();
  console.log("Enrollment response status:", enrollRes.status, enrollData.message);

  if (enrollRes.status !== 201) {
    throw new Error(`Enrollment failed: ${JSON.stringify(enrollData)}`);
  }

  // Await real-time notification on mentor's socket
  receivedNotification = await notifPromise;
  console.log("\n Mentor Received Real-Time Notification on Socket!");
  console.log("  Type:", receivedNotification.type);
  console.log("  Message:", receivedNotification.message);
  console.log("  Course Title:", receivedNotification.course?.title);

  if (receivedNotification.type !== "new_enrollment" || !receivedNotification.message.includes(student.name)) {
    throw new Error("Received notification payload mismatch!");
  }
  console.log(" PASS: Teacher received live enrollment notification without refresh!");

  // Clean up
  mentorSocket.disconnect();
  await mongoose.disconnect();

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
  console.error("FATAL ERROR IN TEST SCRIPT:", err);
  process.exit(1);
});
