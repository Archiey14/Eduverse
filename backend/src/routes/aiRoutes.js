
import express from "express";

import {
  chatWithLessonContext,
  chatWithLessonContextStream,
  getLessonChatHistory,
} from "../controllers/aiController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// All AI routes require the user to be logged in
router.use(protect);

// Existing route: standard AI chat
router.post("/lesson/:lessonId", chatWithLessonContext);

// Existing route: streaming AI chat
router.post(
  "/lesson/:lessonId/stream",
  chatWithLessonContextStream
);

// New route: retrieve saved chat history for a lesson
router.get(
  "/lesson/:lessonId/history",
  getLessonChatHistory
);

export default router;
