import { Router } from "express";
import {
  getAdminStats,
  getAdminUsers,
  updateAdminUser,
  getAdminCourses,
  updateAdminCourseStatus,
  getAdminEnrollments,
} from "../controllers/adminController.js";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();

// Protect all admin routes
router.use(protect, requireRole("admin"));

router.get("/stats", getAdminStats);

// User governance
router.get("/users", getAdminUsers);
router.patch("/users/:id", updateAdminUser);

// Course governance
router.get("/courses", getAdminCourses);
router.patch("/courses/:id/status", updateAdminCourseStatus);

// Platform enrollments
router.get("/enrollments", getAdminEnrollments);

// Categories
router.post("/categories", createCategory);
router.patch("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;
