import { Router } from "express";
import {
  register,
  login,
  googleAuth,
  getMe,
  becomeMentor,
  updateMe,
  updatePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/google", authLimiter, googleAuth);

router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);
router.post("/become-mentor", protect, becomeMentor);
router.patch("/password", protect, updatePassword);

export default router;
