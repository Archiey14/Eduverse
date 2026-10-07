import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Section ID is required"],
    },
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["video", "text"],
      default: "video",
    },
    videoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    durationMin: {
      type: Number,
      default: 0,
    },
    resources: [resourceSchema],
    order: {
      type: Number,
      default: 1,
    },
    isFreePreview: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

lessonSchema.index({ course: 1, sectionId: 1, order: 1 });

export const Lesson = mongoose.model("Lesson", lessonSchema);
