import { Notification } from "../models/Notification.js";
import { emitToUser } from "../config/socket.js";

export const notificationService = {
  notify: async ({ userId, type, message, courseId = null }) => {
    try {
      const notification = await Notification.create({
        user: userId,
        type,
        message,
        course: courseId,
      });

      const populatedNotification = await Notification.findById(notification._id)
        .populate("course", "title slug thumbnailUrl")
        .lean();

      // Real-time delivery to user's socket room
      emitToUser(userId, "new_notification", populatedNotification || notification);

      return populatedNotification || notification;
    } catch (err) {
      console.error(`[NotificationService Error] Failed to create notification: ${err.message}`);
    }
  },

  notifyMany: async (notifications) => {
    try {
      if (Array.isArray(notifications) && notifications.length > 0) {
        const created = await Notification.insertMany(notifications);
        for (const notif of created) {
          emitToUser(notif.user, "new_notification", notif);
        }
        return created;
      }
    } catch (err) {
      console.error(`[NotificationService Error] Failed to insert notifications: ${err.message}`);
    }
  },
};

