import { Notification } from "../models/Notification.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getPaginationParams,
  formatPaginatedResponse,
} from "../utils/pagination.js";

export const getMyNotifications = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { page, limit, skip } = getPaginationParams(req.query, 20, 50);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ user: userId })
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ user: userId }),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  const response = formatPaginatedResponse(notifications, total, page, limit);
  response.unreadCount = unreadCount;

  res.status(200).json(response);
});

export const markNotificationAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return next(new AppError(404, "Notification not found."));
  }

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
});

export const markAllNotificationsAsRead = asyncHandler(
  async (req, res, next) => {
    const userId = req.user._id;

    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  }
);
