
import { Router } from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "node:path";
import fs from "node:fs/promises";

import { protect } from "../middleware/auth.js";
import { uploadChatFile } from "../middleware/upload.js";

import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";

import {
  canAccessConversation,
  getOrCreateCourseConversation,
  getOrCreateDirectConversation,
} from "../utils/messagingAccess.js";

import { getIO } from "../config/socket.js";

const router = Router();

router.use(protect);

const PRIVATE_UPLOADS_DIRECTORY = path.resolve("private-uploads");

// ======================================================
// Helpers
// ======================================================

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getSafeOriginalFileName(name = "") {
  const baseName = path.basename(name.replace(/\\/g, "/"));

  const safeName = baseName
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, 255);

  return safeName || "attachment";
}

async function removeUploadedFile(filePath) {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Could not remove uploaded file:", error);
    }
  }
}

async function removeUploadedFiles(filePaths = []) {
  if (!Array.isArray(filePaths) || filePaths.length === 0) return;
  await Promise.allSettled(
    filePaths.filter(Boolean).map((filePath) => removeUploadedFile(filePath))
  );
}

function emitNewMessage(message, conversationId, participantIds = []) {
  try {
    const io = getIO();

    io.to(`conversation:${conversationId}`).emit("new_message", message);

    for (const participantId of participantIds) {
      io.to(`user:${participantId}`).emit("new_message", message);
    }
  } catch (error) {
    console.error("Could not emit new message event:", error);
  }
}

async function requireConversationAccess(req, res, next) {
  try {
    const { conversationId } = req.params;

    if (!isValidId(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID.",
      });
    }

    const allowed = await canAccessConversation(
      conversationId,
      req.user._id
    );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this conversation.",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}

// ======================================================
// GET /api/messaging/users?search=su
// Search active users.
// ======================================================

router.get("/users", async (req, res, next) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    if (search.length < 2) {
      return res.status(200).json({
        success: true,
        count: 0,
        users: [],
        message: "Enter at least 2 characters to search.",
      });
    }

    if (search.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Search query cannot exceed 80 characters.",
      });
    }

    const searchRegex = new RegExp(escapeRegex(search), "i");

    const users = await User.find({
      _id: { $ne: req.user._id },
      isActive: true,
      $or: [{ name: searchRegex }, { email: searchRegex }],
    })
      .select("_id name email avatarUrl roles")
      .sort({ name: 1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
});

// ======================================================
// GET /api/messaging/conversations
// List course and direct conversations.
// ======================================================

router.get("/conversations", async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [enrollments, mentoredCourses] = await Promise.all([
      Enrollment.find({
        student: userId,
        status: "active",
      })
        .select("course")
        .lean(),

      Course.find({ mentor: userId }).select("_id").lean(),
    ]);

    const courseIds = [
      ...new Set([
        ...enrollments.map((item) => String(item.course)),
        ...mentoredCourses.map((item) => String(item._id)),
      ]),
    ];

    const courseConversations = await Promise.all(
      courseIds.map(async (courseId) => {
        const course = await Course.findById(courseId)
          .select("title thumbnailUrl mentor")
          .lean();

        if (!course) return null;

        const conversation =
          await getOrCreateCourseConversation(courseId);

        const conversationObject =
          typeof conversation.toObject === "function"
            ? conversation.toObject()
            : conversation;

        return {
          ...conversationObject,
          course,
          displayName: course.title,
        };
      })
    );

    const directConversations = await Conversation.find({
      type: "direct",
      participants: userId,
    })
      .populate("participants", "name email avatarUrl")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    const conversations = [
      ...courseConversations.filter(Boolean),
      ...directConversations,
    ].sort(
      (a, b) =>
        new Date(b.lastMessageAt || b.updatedAt).getTime() -
        new Date(a.lastMessageAt || a.updatedAt).getTime()
    );

    return res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    next(error);
  }
});

// ======================================================
// POST /api/messaging/direct/:userId
// Create or retrieve a direct conversation.
// ======================================================

router.post("/direct/:userId", async (req, res, next) => {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = String(req.user._id);

    if (!isValidId(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (currentUserId === String(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot start a conversation with yourself.",
      });
    }

    const otherUser = await User.findOne({
      _id: otherUserId,
      isActive: true,
    }).select("_id name email avatarUrl");

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found or inactive.",
      });
    }

    const conversation = await getOrCreateDirectConversation(
      req.user._id,
      otherUser._id
    );

    const populatedConversation = await Conversation.findById(
      conversation._id
    ).populate("participants", "name email avatarUrl");

    return res.status(200).json({
      success: true,
      conversation: populatedConversation,
    });
  } catch (error) {
    next(error);
  }
});

// ======================================================
// GET /api/messaging/conversations/:conversationId/messages
// Retrieve message history in chronological order.
// ======================================================

router.get(
  "/conversations/:conversationId/messages",
  async (req, res, next) => {
    try {
      const { conversationId } = req.params;

      if (!isValidId(conversationId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid conversation ID.",
        });
      }

      const allowed = await canAccessConversation(
        conversationId,
        req.user._id
      );

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "You cannot access this conversation.",
        });
      }

      const limitValue = Number.parseInt(req.query.limit, 10);

      const limit = Number.isFinite(limitValue)
        ? Math.min(Math.max(limitValue, 1), 100)
        : 50;

      const query = { conversation: conversationId };

      if (req.query.before) {
        const beforeDate = new Date(req.query.before);

        if (Number.isNaN(beforeDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "The before parameter must be a valid date.",
          });
        }

        query.createdAt = { $lt: beforeDate };
      }

      const fetchedMessages = await Message.find(query)
        .populate("sender", "name avatarUrl")
        .populate("reactions.user", "name")
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit)
        .lean();

      const messages = fetchedMessages.reverse();

      return res.status(200).json({
        success: true,
        count: messages.length,
        messages,
        hasMore: messages.length === limit,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ======================================================
// POST /api/messaging/conversations/:conversationId/attachments
// Upload attachments and create file messages.
// Supports single ("file") and multiple ("files") file fields,
// plus optional "content" message text.
// ======================================================

router.post(
  "/conversations/:conversationId/attachments",
  requireConversationAccess,
  (req, res, next) => {
    uploadChatFile.any()(req, res, (error) => {
      if (!error) return next();

      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            success: false,
            message: "File size cannot exceed 10 MB.",
          });
        }

        if (error.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            message: "You can upload a maximum of 10 files at once.",
          });
        }

        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || "Invalid attachment.",
      });
    });
  },
  async (req, res, next) => {
    let uploadedFilePaths = [];

    try {
      const uploadedFiles = Array.isArray(req.files)
        ? req.files
        : req.file
        ? [req.file]
        : [];

      if (uploadedFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please select at least one file to upload.",
        });
      }

      uploadedFilePaths = uploadedFiles.map((file) => file.path);

      const { conversationId } = req.params;

      const conversation = await Conversation.findById(conversationId)
        .select("participants")
        .lean();

      if (!conversation) {
        await removeUploadedFiles(uploadedFilePaths);

        return res.status(404).json({
          success: false,
          message: "Conversation not found.",
        });
      }

      const contentText =
        typeof req.body.content === "string" ? req.body.content.trim() : "";

      const createdMessages = [];
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const message = await Message.create({
          conversation: conversationId,
          sender: req.user._id,
          // Attach caption text to the first file message
          content: i === 0 ? contentText : "",
          type: "file",
          attachment: {
            fileName: getSafeOriginalFileName(file.originalname),
            storedName: file.filename,
            mimeType: file.mimetype,
            size: file.size,
          },
        });
        createdMessages.push(message);
      }

      const lastMessage = createdMessages[createdMessages.length - 1];
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: lastMessage._id,
        lastMessageAt: lastMessage.createdAt,
      });

      const populatedMessages = await Message.find({
        _id: { $in: createdMessages.map((msg) => msg._id) },
      })
        .populate("sender", "name avatarUrl")
        .populate("reactions.user", "name")
        .sort({ createdAt: 1, _id: 1 })
        .lean();

      const participantIds = (conversation.participants || []).map(
        (participant) => String(participant)
      );

      for (const popMsg of populatedMessages) {
        emitNewMessage(
          popMsg,
          String(conversationId),
          participantIds
        );
      }

      uploadedFilePaths = [];

      return res.status(201).json({
        success: true,
        message:
          uploadedFiles.length === 1
            ? "Attachment uploaded successfully."
            : "Attachments uploaded successfully.",
        data: populatedMessages,
        messages: populatedMessages,
        message: populatedMessages[0],
      });
    } catch (error) {
      await removeUploadedFiles(uploadedFilePaths);
      next(error);
    }
  }
);

// ======================================================
// GET /api/messaging/attachments/:messageId/download
// Download a file only if the user can access its conversation.
// ======================================================

router.get("/attachments/:messageId/download", async (req, res, next) => {
  try {
    const { messageId } = req.params;

    if (!isValidId(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const message = await Message.findById(messageId).lean();

    if (!message || message.type !== "file" || !message.attachment) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found.",
      });
    }

    const allowed = await canAccessConversation(
      message.conversation,
      req.user._id
    );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this attachment.",
      });
    }

    const storedName = message.attachment.storedName;

    // Stored names are generated by the server, never supplied by the client.
    if (
      typeof storedName !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(storedName)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid attachment storage reference.",
      });
    }

    const filePath = path.resolve(
      PRIVATE_UPLOADS_DIRECTORY,
      storedName
    );

    if (path.dirname(filePath) !== PRIVATE_UPLOADS_DIRECTORY) {
      return res.status(400).json({
        success: false,
        message: "Invalid attachment path.",
      });
    }

    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: "The attachment file is no longer available.",
      });
    }

    res.setHeader("X-Content-Type-Options", "nosniff");

    return res.download(
      filePath,
      getSafeOriginalFileName(message.attachment.fileName),
      (error) => {
        if (error && !res.headersSent) {
          next(error);
        }
      }
    );
  } catch (error) {
    next(error);
  }
});

export default router;
