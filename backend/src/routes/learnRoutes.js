import { Router } from "express";
import {
  getLearnerCourseView,
  getLessonContent,
  markLessonComplete,
  unmarkLessonComplete,
  getLearnerQuiz,
  submitQuizAttempt,
  getMyQuizAttempts,
} from "../controllers/learnController.js";
import {
  getDiscussions,
  createDiscussion,
  createReply,
} from "../controllers/discussionController.js";
import { protect, optionalAuth } from "../middleware/auth.js";

const router = Router();

// Lesson content: guests may view free previews, everything else needs auth
router.get("/lessons/:lessonId", optionalAuth, getLessonContent);

// Protected learner operations
router.use(protect);

router.get("/courses/:id", getLearnerCourseView);
router.post("/lessons/:lessonId/complete", markLessonComplete);
router.delete("/lessons/:lessonId/complete", unmarkLessonComplete);

router.get("/quizzes/:quizId", getLearnerQuiz);
router.post("/quizzes/:quizId/attempts", submitQuizAttempt);
router.get("/quizzes/:quizId/attempts", getMyQuizAttempts);

router.get("/courses/:courseId/discussions", getDiscussions);
router.post("/courses/:courseId/discussions", createDiscussion);
router.post("/discussions/:discussionId/replies", createReply);

export default router;
