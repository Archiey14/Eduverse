import { Activity } from "../models/Activity.js";

export const activityService = {
  log: async ({ userId, type, courseId = null, refId = null, message }) => {
    try {
      await Activity.create({
        user: userId,
        type,
        course: courseId,
        refId,
        message,
      });
    } catch (err) {
      console.error(`[ActivityService Error] Failed to log activity: ${err.message}`);
    }
  },
};
