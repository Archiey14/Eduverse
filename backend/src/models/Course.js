import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Section title is required"],
      trim: true,
    },
    order: {
      type: Number,
      default: 1,
    },
  },
  { _id: true }
);

const courseStatsSchema = new mongoose.Schema(
  {
    lessonCount: { type: Number, default: 0 },
    quizCount: { type: Number, default: 0 },
    totalDurationMin: { type: Number, default: 0 },
    enrollmentCount: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Mentor reference is required"],
    },
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Course slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    language: {
      type: String,
      default: "English",
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      default: "",
      trim: true,
    },
    previewVideoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    learningOutcomes: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    sections: [sectionSchema],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
    },
    stats: {
      type: courseStatsSchema,
      default: () => ({
        lessonCount: 0,
        quizCount: 0,
        totalDurationMin: 0,
        enrollmentCount: 0,
        ratingAvg: 0,
        ratingCount: 0,
      }),
    },
  },
  {
    timestamps: true,
  }
);

courseSchema.index(
  { title: "text", subtitle: "text", description: "text" },
  { weights: { title: 5, subtitle: 2, description: 1 }, name: "CourseTextIndex" }
);
courseSchema.index({ status: 1, category: 1, createdAt: -1 });
courseSchema.index({ mentor: 1, status: 1 });

export const Course = mongoose.model("Course", courseSchema);
