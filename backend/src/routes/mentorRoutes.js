import { Router } from "express";
import {
  getMentorDashboard,
  createDraftCourse,
  getMyCourses,
  getMyCourseById,
  updateCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  getCourseStudents,
  getCourseStudentDetail,
} from "../controllers/mentorCourseController.js";
import {
  addSection,
  updateSection,
  deleteSection,
  reorderSections,
} from "../controllers/sectionController.js";
import {
  addLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} from "../controllers/lessonController.js";
import {
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quizController.js";
import { replyToReview } from "../controllers/reviewController.js";
import { protect, requireRole } from "../middleware/auth.js";
import { loadOwnedCourse } from "../middleware/ownership.js";

const router = Router();

// Protect all mentor routes
router.use(protect, requireRole("mentor", "admin"));

// Dashboard & Course overview
router.get("/dashboard", getMentorDashboard);
router.post("/courses", createDraftCourse);
router.get("/courses", getMyCourses);
router.get("/courses/:id", loadOwnedCourse, getMyCourseById);
router.patch("/courses/:id", loadOwnedCourse, updateCourse);
router.delete("/courses/:id", loadOwnedCourse, deleteCourse);
router.post("/courses/:id/publish", loadOwnedCourse, publishCourse);
router.post("/courses/:id/unpublish", loadOwnedCourse, unpublishCourse);

// Sections
router.post("/courses/:id/sections", loadOwnedCourse, addSection);
router.patch("/courses/:id/sections/reorder", loadOwnedCourse, reorderSections);
router.patch("/courses/:id/sections/:sectionId", loadOwnedCourse, updateSection);
router.delete("/courses/:id/sections/:sectionId", loadOwnedCourse, deleteSection);

// Lessons
router.post("/courses/:id/lessons", loadOwnedCourse, addLesson);
router.patch("/courses/:id/lessons/reorder", loadOwnedCourse, reorderLessons);
router.patch("/lessons/:lessonId", updateLesson);
router.delete("/lessons/:lessonId", deleteLesson);

// Quizzes
router.post("/courses/:id/quizzes", loadOwnedCourse, createQuiz);
router.get("/quizzes/:quizId", getQuizById);
router.patch("/quizzes/:quizId", updateQuiz);
router.delete("/quizzes/:quizId", deleteQuiz);

// Students progress oversight
router.get("/courses/:id/students", loadOwnedCourse, getCourseStudents);
router.get(
  "/courses/:id/students/:studentId",
  loadOwnedCourse,
  getCourseStudentDetail
);

// Review replies
router.post("/reviews/:reviewId/reply", replyToReview);

export default router;
