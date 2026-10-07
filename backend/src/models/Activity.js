import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "enrolled",
        "lesson_completed",
        "quiz_attempted",
        "quiz_passed",
        "course_completed",
        "course_published",
      ],
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 180 * 24 * 60 * 60, // 180 days TTL
    },
  },
  {
    timestamps: false,
  }
);

activitySchema.index({ user: 1, createdAt: -1 });

export const Activity = mongoose.model("Activity", activitySchema);
