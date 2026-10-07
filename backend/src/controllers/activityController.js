import { Activity } from "../models/Activity.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getPaginationParams,
  formatPaginatedResponse,
} from "../utils/pagination.js";

export const getMyActivities = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { page, limit, skip } = getPaginationParams(req.query, 20, 50);

  const [activities, total] = await Promise.all([
    Activity.find({ user: userId })
      .populate("course", "title slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Activity.countDocuments({ user: userId }),
  ]);

  res.status(200).json(formatPaginatedResponse(activities, total, page, limit));
});
