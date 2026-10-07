import { Router } from "express";
import {
  getCourses,
  getCourseByIdOrSlug,
} from "../controllers/courseController.js";
import {
  getCourseReviews,
  createOrUpdateReview,
  deleteMyReview,
} from "../controllers/reviewController.js";
import { protect, optionalAuth } from "../middleware/auth.js";

const router = Router();

// Public course catalog
router.get("/", getCourses);
router.get("/:idOrSlug", optionalAuth, getCourseByIdOrSlug);

// Reviews attached to courses
router.get("/:id/reviews", getCourseReviews);
router.post("/:id/reviews", protect, createOrUpdateReview);
router.delete("/:id/reviews/mine", protect, deleteMyReview);

export default router;
