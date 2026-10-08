import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
    },
    isInstructorResponse: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

discussionSchema.index({ course: 1, parent: 1, createdAt: -1 });

export const Discussion = mongoose.model("Discussion", discussionSchema);
