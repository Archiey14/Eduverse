
import { Server } from "socket.io";
import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { verifyToken } from "../utils/token.js";
import { Message } from "../models/Message.js";
import { Conversation } from "../models/Conversation.js";
import { canAccessConversation } from "../utils/messagingAccess.js";

let io;

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

  // Authenticate every socket connection with the existing JWT.
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
    } catch {
      next(new Error("Socket authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Messaging] Connected: ${socket.user.id}`);

    // Join personal user room for targeted notifications and cross-conversation message delivery
    socket.join(`user:${socket.user.id}`);

    // Automatically join all course conversation rooms in the background without blocking listeners
    (async () => {
      try {
        const [enrollments, mentoredCourses] = await Promise.all([
          Enrollment.find({ student: socket.user.id, status: "active" })
            .select("course")
            .lean(),
          Course.find({ mentor: socket.user.id })
            .select("_id")
            .lean(),
        ]);

        const courseIds = [
          ...new Set([
            ...enrollments.map((e) => String(e.course)),
            ...mentoredCourses.map((c) => String(c._id)),
          ]),
        ];

        for (const courseId of courseIds) {
          const courseConv = await Conversation.findOne({
            type: "course",
            course: courseId,
          })
            .select("_id")
            .lean();

          if (courseConv) {
            socket.join(`conversation:${courseConv._id}`);
          }
        }
      } catch (err) {
        console.error("Error auto-joining course rooms on connect:", err);
      }
    })();

    // Join only after the server verifies conversation access.
    socket.on("join_conversation", async (payload, callback) => {
      try {
        const conversationId = payload?.conversationId;

        if (
          typeof conversationId !== "string" ||
          !(await canAccessConversation(conversationId, socket.user.id))
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
        callback?.({ ok: false, error: "Unable to join conversation." });
      }
    });

    socket.on("leave_conversation", (payload, callback) => {
      const conversationId = payload?.conversationId;

      if (typeof conversationId === "string") {
        socket.leave(`conversation:${conversationId}`);
      }

      callback?.({ ok: true });
    });

    // Message persistence and delivery happen on the server.
    socket.on("send_message", async (payload, callback) => {
      console.log(`[Messaging] send_message from ${socket.user?.id}:`, payload);
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
            error: "Provide a conversation ID and a message of 1–5000 characters.",
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

        // Ensure conversation is a clean string ID
        const populatedMessage = {
          ...rawPopulatedMessage,
          conversation: String(conversationId),
        };

        // Collect target rooms: conversation room + personal user rooms for notification delivery
        const targetRooms = new Set([`conversation:${conversationId}`]);

        if (
          updatedConversation &&
          updatedConversation.type === "direct" &&
          Array.isArray(updatedConversation.participants)
        ) {
          for (const participantId of updatedConversation.participants) {
            targetRooms.add(`user:${participantId}`);
          }
        } else if (
          updatedConversation &&
          updatedConversation.type === "course" &&
          updatedConversation.course
        ) {
          try {
            const course = await Course.findById(
              updatedConversation.course
            ).select("mentor");

            const enrollments = await Enrollment.find({
              course: updatedConversation.course,
              status: "active",
            }).select("student");

            if (course?.mentor) {
              targetRooms.add(`user:${course.mentor}`);
            }
            if (Array.isArray(enrollments)) {
              for (const en of enrollments) {
                if (en.student) {
                  targetRooms.add(`user:${en.student}`);
                }
              }
            }
          } catch (err) {
            console.error("Error broadcasting course message to students:", err);
          }
        }

        // Socket.IO automatically deduplicates sockets when chaining .to() so each client receives the message exactly once
        let broadcastTarget = io;
        for (const room of targetRooms) {
          broadcastTarget = broadcastTarget.to(room);
        }
        broadcastTarget.emit("new_message", populatedMessage);

        callback?.({ ok: true, message: populatedMessage });
      } catch (error) {
        console.error("Send message error:", error);
        callback?.({
          ok: false,
          error: "Unable to send message. Please try again.",
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
