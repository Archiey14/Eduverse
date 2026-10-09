
import { Lesson } from "../models/Lesson.js";
import { Enrollment } from "../models/Enrollment.js";
import { aiService } from "../services/aiService.js";
import { ChatConversation } from "../models/ChatConversation.js";

/**
 * @desc    Chat with the AI Course Assistant based on the current lesson
 * @route   POST /api/chat/lesson/:lessonId
 * @access  Private (Student Enrolled)
 */
export const chatWithLessonContext = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { message } = req.body;
    const studentId = req.user._id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    // 1. Find the lesson to provide context
    const lesson = await Lesson.findById(lessonId).populate(
      "course",
      "title"
    );

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found.",
      });
    }

    // 2. Verify enrollment in the course containing this lesson
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: lesson.course._id,
      status: "active",
    });

    // Admins and mentors can access the assistant without enrollment
    if (
      !enrollment &&
      !req.user.roles.includes("admin") &&
      !req.user.roles.includes("mentor")
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You must be enrolled in this course to use the AI Assistant.",
      });
    }

    // 3. Generate the AI response
    const responseText = await aiService.getLessonChatResponse(
      lesson,
      message
    );

    // Keep the existing response format unchanged
    res.status(200).json({
      success: true,
      data: responseText,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to process chat request.",
    });
  }
};

/**
 * @desc    Stream the AI Course Assistant response and save chat history
 * @route   POST /api/chat/lesson/:lessonId/stream
 * @access  Private (Student Enrolled)
 */
export const chatWithLessonContextStream = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { message } = req.body;
    const studentId = req.user._id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    // 1. Find the lesson to provide context
    const lesson = await Lesson.findById(lessonId).populate(
      "course",
      "title"
    );

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found.",
      });
    }

    // 2. Verify enrollment in the course containing this lesson
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: lesson.course._id,
      status: "active",
    });

    if (
      !enrollment &&
      !req.user.roles.includes("admin") &&
      !req.user.roles.includes("mentor")
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You must be enrolled in this course to use the AI Assistant.",
      });
    }

    // 3. Find or create this user's conversation for this lesson
    let conversation = await ChatConversation.findOne({
      user: studentId,
      lesson: lessonId,
    });

    if (!conversation) {
      conversation = await ChatConversation.create({
        user: studentId,
        lesson: lessonId,
        lessonTitle: lesson.title,
        messages: [],
      });
    }

    // 4. Save the user's message
    conversation.messages.push({
      role: "user",
      text: message.trim(),
    });

    await conversation.save();

    // 5. Start the existing AI streaming service
    const stream = await aiService.getLessonChatStream(
      lesson,
      message.trim()
    );

    // Keep the existing Server-Sent Events format
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let completeResponse = "";

    // 6. Stream the response to the frontend and collect the full answer
    for await (const chunkText of stream) {
      if (chunkText) {
        completeResponse += chunkText;
        res.write(`data: ${JSON.stringify(chunkText)}\n\n`);
      }
    }

    // 7. Save the completed AI response to the conversation
    if (completeResponse) {
      conversation.messages.push({
        role: "ai",
        text: completeResponse,
      });

      await conversation.save();
    }

    // Keep the existing stream completion marker
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("AI Chat Stream Error:", error);

    // Preserve the existing stream error marker
    if (!res.headersSent) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
    }

    res.write("data: [ERROR]\n\n");
    res.end();
  }
};

/**
 * @desc    Get the current user's chat history for a lesson
 * @route   GET /api/chat/lesson/:lessonId/history
 * @access  Private
 */
export const getLessonChatHistory = async (req, res) => {
  try {
    const { lessonId } = req.params;

    // 1. Check that the lesson exists
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found.",
      });
    }

    // 2. Retrieve only this user's conversation for this lesson
    const conversation = await ChatConversation.findOne({
      user: req.user._id,
      lesson: lessonId,
    }).lean();

    // 3. Return the existing history, or null if no conversation exists
    return res.status(200).json({
      success: true,
      data: conversation || null,
    });
  } catch (error) {
    console.error("Chat History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load chat history.",
    });
  }
};
