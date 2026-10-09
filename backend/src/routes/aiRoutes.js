import express from "express";
import { chatWithLessonContext, chatWithLessonContextStream } from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All AI routes should require the user to be logged in
router.use(protect);

router.post("/lesson/:lessonId", chatWithLessonContext);
router.post("/lesson/:lessonId/stream", chatWithLessonContextStream);

export default router;
