import { Router } from "express";

import {
  register,
  login,
  googleAuth,
  getMe,
  becomeMentor,
  updateMe,
  updatePassword,
  verifyOTP,
  uploadAvatar,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import { protect } from "../middleware/auth.js";

import { authLimiter } from "../middleware/rateLimit.js";

import { uploadProfilePicture } from "../middleware/upload.js";

const router = Router();

// Register
router.post(
  "/register",
  authLimiter,
  register
);

// Login
router.post(
  "/login",
  authLimiter,
  login
);

// Verify OTP
router.post(
  "/verify-otp",
  authLimiter,
  verifyOTP
);

// Google authentication
router.post(
  "/google",
  authLimiter,
  googleAuth
);

// Get logged-in user
router.get(
  "/me",
  protect,
  getMe
);

// Update profile
router.patch(
  "/me",
  protect,
  updateMe
);

// Upload profile picture
router.post(
  "/avatar",
  protect,
  uploadProfilePicture.single("avatar"),
  uploadAvatar
);

// Become a mentor
router.post(
  "/become-mentor",
  protect,
  becomeMentor
);

// Change password
router.patch(
  "/password",
  protect,
  updatePassword
);

// Forgot password
router.post(
  "/forgot-password",
  authLimiter,
  forgotPassword
);

// Reset password
router.patch(
  "/reset-password/:token",
  authLimiter,
  resetPassword
);

export default router;