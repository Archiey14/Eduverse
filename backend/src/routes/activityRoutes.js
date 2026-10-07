import { Router } from "express";
import { getMyActivities } from "../controllers/activityController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/mine", protect, getMyActivities);

export default router;
