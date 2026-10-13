
import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    emoji: {
      type: String,
      required: true,
      enum: ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🎉"],
    },
  },
  { _id: false }
);

const attachmentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    storedName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    type: {
      type: String,
      enum: ["text", "file"],
      default: "text",
      required: true,
    },

    attachment: {
      type: attachmentSchema,
      default: undefined,
    },

    reactions: {
      type: [reactionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Validate that text messages contain text and file messages contain a file.
messageSchema.pre("validate", function () {
  if (this.type === "text" && !this.content?.trim()) {
    this.invalidate("content", "Text messages cannot be empty.");
  }

  if (this.type === "file" && !this.attachment) {
    this.invalidate("attachment", "File messages require an attachment.");
  }
});

messageSchema.index({ conversation: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
