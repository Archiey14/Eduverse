import { Router } from "express";
import {
  getStudentDashboard,
  getStudentQuizzes,
} from "../controllers/dashboardController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/dashboard", protect, getStudentDashboard);
router.get("/quizzes", protect, getStudentQuizzes);

export default router;
