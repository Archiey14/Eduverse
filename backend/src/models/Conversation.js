
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["course", "direct"],
      required: true,
    },

    // Used only for course group conversations.
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    // Used for one-to-one conversations.
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Stable key prevents duplicate direct conversations.
    // Example: smallerUserId_largerUserId
    directKey: {
      type: String,
      default: null,
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// One group conversation per course.
conversationSchema.index(
  { course: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "course" },
  }
);

// One direct conversation per user pair.
conversationSchema.index(
  { directKey: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "direct" },
  }
);

export const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);
