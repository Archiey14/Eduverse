
import { Server } from "socket.io";
import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { verifyToken } from "../utils/token.js";
import { Message } from "../models/Message.js";
import { Conversation } from "../models/Conversation.js";
import { canAccessConversation } from "../utils/messagingAccess.js";

let io;

const ALLOWED_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🎉"];

export const initializeSocket = (httpServer) => {
  if (io) return io;

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }

        const isLocalhost =
          /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

        const configuredClient =
          process.env.CLIENT_URL || "http://localhost:5173";

        if (isLocalhost || origin === configuredClient) {
          return callback(null, true);
        }

        return callback(new Error("Origin not allowed by Socket.IO CORS"));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authenticate every socket connection using the existing JWT.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        return next(new Error("Invalid or inactive user"));
      }

      socket.user = {
        id: String(user._id),
        name: user.name,
      };

      next();
    } catch (error) {
      next(new Error("Socket authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Messaging] Connected: ${socket.user.id}`);

    // Personal room for notifications and cross-conversation delivery.
    socket.join(`user:${socket.user.id}`);

    // Automatically join course conversation rooms.
    (async () => {
      try {
        const [enrollments, mentoredCourses] = await Promise.all([
          Enrollment.find({
            student: socket.user.id,
            status: "active",
          })
            .select("course")
            .lean(),

          Course.find({ mentor: socket.user.id })
            .select("_id")
            .lean(),
        ]);

        const courseIds = [
          ...new Set([
            ...enrollments.map((enrollment) =>
              String(enrollment.course)
            ),
            ...mentoredCourses.map((course) => String(course._id)),
          ]),
        ];

        for (const courseId of courseIds) {
          const courseConversation = await Conversation.findOne({
            type: "course",
            course: courseId,
          })
            .select("_id")
            .lean();

          if (courseConversation) {
            socket.join(`conversation:${courseConversation._id}`);
          }
        }
      } catch (error) {
        console.error("Error auto-joining course rooms:", error);
      }
    })();

    // Join a conversation only after verifying access.
    socket.on("join_conversation", async (payload, callback) => {
      try {
        const conversationId = payload?.conversationId;

        if (
          typeof conversationId !== "string" ||
          !(await canAccessConversation(
            conversationId,
            socket.user.id
          ))
        ) {
          return callback?.({
            ok: false,
            error: "You cannot access this conversation.",
          });
        }

        socket.join(`conversation:${conversationId}`);

        callback?.({ ok: true });
      } catch (error) {
        console.error("Join conversation error:", error);

        callback?.({
          ok: false,
          error: "Unable to join conversation.",
        });
      }
    });

    // Leave a conversation room.
    socket.on("leave_conversation", (payload, callback) => {
      const conversationId = payload?.conversationId;

      if (typeof conversationId === "string") {
        socket.leave(`conversation:${conversationId}`);
      }

      callback?.({ ok: true });
    });

    // Send and persist a message.
    socket.on("send_message", async (payload, callback) => {
      try {
        const conversationId = payload?.conversationId;
        const content =
          typeof payload?.content === "string"
            ? payload.content.trim()
            : "";

        if (
          typeof conversationId !== "string" ||
          !content ||
          content.length > 5000
        ) {
          return callback?.({
            ok: false,
            error:
              "Provide a conversation ID and a message of 1–5000 characters.",
          });
        }

        const allowed = await canAccessConversation(
          conversationId,
          socket.user.id
        );

        if (!allowed) {
          return callback?.({
            ok: false,
            error: "You cannot send messages to this conversation.",
          });
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.user.id,
          content,
          type: "text",
        });

        const updatedConversation = await Conversation.findByIdAndUpdate(
          conversationId,
          {
            lastMessage: message._id,
            lastMessageAt: message.createdAt,
          },
          { new: true }
        ).select("type participants course");

        const rawPopulatedMessage = await Message.findById(message._id)
          .populate("sender", "name avatarUrl")
          .lean();

        const populatedMessage = {
          ...rawPopulatedMessage,
          conversation: String(conversationId),
        };

        // Broadcast to the conversation and relevant personal rooms.
        const targetRooms = new Set([
          `conversation:${conversationId}`,
        ]);

        if (
          updatedConversation?.type === "direct" &&
          Array.isArray(updatedConversation.participants)
        ) {
          for (const participantId of updatedConversation.participants) {
            targetRooms.add(`user:${String(participantId)}`);
          }
        } else if (
          updatedConversation?.type === "course" &&
          updatedConversation.course
        ) {
          try {
            const [course, enrollments] = await Promise.all([
              Course.findById(updatedConversation.course)
                .select("mentor")
                .lean(),

              Enrollment.find({
                course: updatedConversation.course,
                status: "active",
              })
                .select("student")
                .lean(),
            ]);

            if (course?.mentor) {
              targetRooms.add(`user:${String(course.mentor)}`);
            }

            for (const enrollment of enrollments) {
              if (enrollment.student) {
                targetRooms.add(`user:${String(enrollment.student)}`);
              }
            }
          } catch (error) {
            console.error(
              "Error broadcasting course message:",
              error
            );
          }
        }

        let broadcastTarget = io;

        for (const room of targetRooms) {
          broadcastTarget = broadcastTarget.to(room);
        }

        broadcastTarget.emit("new_message", populatedMessage);

        callback?.({
          ok: true,
          message: populatedMessage,
        });
      } catch (error) {
        console.error("Send message error:", error);

        callback?.({
          ok: false,
          error: "Unable to send message. Please try again.",
        });
      }
    });

    // Add a reaction or change the current user's reaction.
    socket.on("add_reaction", async (payload, callback) => {
      try {
        const { conversationId, messageId, emoji } = payload || {};

        if (
          typeof conversationId !== "string" ||
          typeof messageId !== "string" ||
          !ALLOWED_REACTIONS.includes(emoji)
        ) {
          return callback?.({
            ok: false,
            error: "Invalid reaction details.",
          });
        }

        const hasAccess = await canAccessConversation(
          conversationId,
          socket.user.id
        );

        if (!hasAccess) {
          return callback?.({
            ok: false,
            error: "You cannot access this conversation.",
          });
        }

        const message = await Message.findOne({
          _id: messageId,
          conversation: conversationId,
        });

        if (!message) {
          return callback?.({
            ok: false,
            error: "Message not found.",
          });
        }

        // Keep only one reaction per user per message.
        const existingReaction = message.reactions.find(
          (reaction) => String(reaction.user) === socket.user.id
        );

        if (existingReaction) {
          existingReaction.emoji = emoji;
        } else {
          message.reactions.push({
            user: socket.user.id,
            emoji,
          });
        }

        await message.save();

        const updatedMessage = await Message.findById(message._id)
          .populate("reactions.user", "name")
          .lean();

        const reactionData = {
          conversationId: String(conversationId),
          messageId: String(message._id),
          reactions: updatedMessage.reactions,
        };

        io.to(`conversation:${conversationId}`).emit(
          "message_reactions_updated",
          reactionData
        );

        callback?.({
          ok: true,
          ...reactionData,
        });
      } catch (error) {
        console.error("Add reaction error:", error);

        callback?.({
          ok: false,
          error: "Unable to add reaction. Please try again.",
        });
      }
    });

    // Remove only the current user's reaction.
    socket.on("remove_reaction", async (payload, callback) => {
      try {
        const { conversationId, messageId } = payload || {};

        if (
          typeof conversationId !== "string" ||
          typeof messageId !== "string"
        ) {
          return callback?.({
            ok: false,
            error: "Invalid reaction details.",
          });
        }

        const hasAccess = await canAccessConversation(
          conversationId,
          socket.user.id
        );

        if (!hasAccess) {
          return callback?.({
            ok: false,
            error: "You cannot access this conversation.",
          });
        }

        const message = await Message.findOne({
          _id: messageId,
          conversation: conversationId,
        });

        if (!message) {
          return callback?.({
            ok: false,
            error: "Message not found.",
          });
        }

        message.reactions = message.reactions.filter(
          (reaction) => String(reaction.user) !== socket.user.id
        );

        await message.save();

        const updatedMessage = await Message.findById(message._id)
          .populate("reactions.user", "name")
          .lean();

        const reactionData = {
          conversationId: String(conversationId),
          messageId: String(message._id),
          reactions: updatedMessage.reactions,
        };

        io.to(`conversation:${conversationId}`).emit(
          "message_reactions_updated",
          reactionData
        );

        callback?.({
          ok: true,
          ...reactionData,
        });
      } catch (error) {
        console.error("Remove reaction error:", error);

        callback?.({
          ok: false,
          error: "Unable to remove reaction. Please try again.",
        });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(
        `[Messaging] Disconnected: ${socket.user.id} (${reason})`
      );
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized.");
  }

  return io;
};

export const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user:${String(userId)}`).emit(event, data);
  }
};
