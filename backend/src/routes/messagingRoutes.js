
import { Router } from "express";
import mongoose from "mongoose";

import { protect } from "../middleware/auth.js";
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

const router = Router();

// All messaging routes require authentication.
router.use(protect);

// ======================================================
// GET /api/messaging/users?search=su
// Search active users to start a direct conversation.
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

    // Escape regex characters so the input is treated as literal text.
    const escapedSearch = search.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const searchRegex = new RegExp(escapedSearch, "i");

    const users = await User.find({
      _id: { $ne: req.user._id },
      isActive: true,
      $or: [
        { name: searchRegex },
        { email: searchRegex },
      ],
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
// Get course group chats and existing direct conversations.
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

      Course.find({ mentor: userId })
        .select("_id")
        .lean(),
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

        if (!course) {
          return null;
        }

        const conversation =
          await getOrCreateCourseConversation(courseId);

        return {
          ...conversation.toObject(),
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
// Create or retrieve a private conversation with a user.
// ======================================================
router.post("/direct/:userId", async (req, res, next) => {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = String(req.user._id);

    if (!mongoose.isValidObjectId(otherUserId)) {
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

      if (!mongoose.isValidObjectId(conversationId)) {
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

      const limitValue = Number.parseInt(
        req.query.limit,
        10
      );

      const limit = Number.isFinite(limitValue)
        ? Math.min(Math.max(limitValue, 1), 100)
        : 50;

      const query = {
        conversation: conversationId,
      };

      if (req.query.before) {
        const beforeDate = new Date(req.query.before);

        if (Number.isNaN(beforeDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "The before parameter must be a valid date.",
          });
        }

        query.createdAt = {
          $lt: beforeDate,
        };
      }

      // Fetch newest messages first.
      const fetchedMessages = await Message.find(query)
        .populate("sender", "name avatarUrl")
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit)
        .lean();

      // Return them oldest-to-newest for the chat interface.
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

export default router;
