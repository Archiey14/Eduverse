import { Notification } from "../models/Notification.js";

export const notificationService = {
  notify: async ({ userId, type, message, courseId = null }) => {
    try {
      await Notification.create({
        user: userId,
        type,
        message,
        course: courseId,
      });
    } catch (err) {
      console.error(`[NotificationService Error] Failed to create notification: ${err.message}`);
    }
  },

  notifyMany: async (notifications) => {
    try {
      if (Array.isArray(notifications) && notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (err) {
      console.error(`[NotificationService Error] Failed to insert notifications: ${err.message}`);
    }
  },
};
