import { Router } from "express";
import {
  enrollCourse,
  getMyEnrollments,
  unenrollCourse,
} from "../controllers/enrollmentController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.post("/", enrollCourse);
router.get("/mine", getMyEnrollments);
router.delete("/:courseId", unenrollCourse);

export default router;
