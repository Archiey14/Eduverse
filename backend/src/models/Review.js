import mongoose from "mongoose";

const mentorReplySchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, "Reply cannot exceed 1000 characters"],
    },
    repliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
      default: "",
    },
    mentorReply: {
      type: mentorReplySchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ course: 1, student: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
