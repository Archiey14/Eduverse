import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    options: {
      type: [String],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length >= 2 && val.length <= 6;
        },
        message: "Question must have between 2 and 6 options",
      },
    },
    correctIndex: {
      type: Number,
      required: [true, "Correct option index is required"],
    },
    explanation: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
    },
    instructions: {
      type: String,
      default: "",
      trim: true,
    },
    passPercent: {
      type: Number,
      default: 70,
      min: 1,
      max: 100,
    },
    maxAttempts: {
      type: Number,
      default: null, // null/undefined means unlimited
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    questions: [questionSchema],
  },
  {
    timestamps: true,
  }
);

quizSchema.index({ course: 1 });

export const Quiz = mongoose.model("Quiz", quizSchema);
