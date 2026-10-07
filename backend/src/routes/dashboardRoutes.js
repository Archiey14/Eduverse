import { Router } from "express";
import { getStudentDashboard } from "../controllers/dashboardController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/dashboard", protect, getStudentDashboard);

export default router;
