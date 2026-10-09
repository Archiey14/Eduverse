import { Lesson } from "../models/Lesson.js";
import { Enrollment } from "../models/Enrollment.js";
import { aiService } from "../services/aiService.js";

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
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    // 1. Find the lesson to provide context
    const lesson = await Lesson.findById(lessonId).populate("course", "title");
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found." });
    }

    // 2. Verify the student is enrolled in the course containing this lesson
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: lesson.course._id,
      status: "active",
    });

    // If not enrolled and not an admin/mentor (optional check, assuming basic flow for now)
    if (!enrollment && !req.user.roles.includes("admin") && !req.user.roles.includes("mentor")) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to use the AI Assistant.",
      });
    }

    // 3. Ask the AI Service to generate a response
    const responseText = await aiService.getLessonChatResponse(lesson, message);

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

export const chatWithLessonContextStream = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { message } = req.body;
    const studentId = req.user._id;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    const lesson = await Lesson.findById(lessonId).populate("course", "title");
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found." });
    }

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: lesson.course._id,
      status: "active",
    });

    if (!enrollment && !req.user.roles.includes("admin") && !req.user.roles.includes("mentor")) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to use the AI Assistant.",
      });
    }

    const stream = await aiService.getLessonChatStream(lesson, message);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunkText of stream) {
      if (chunkText) {
        res.write(`data: ${JSON.stringify(chunkText)}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("AI Chat Stream Error:", error);
    res.write(`data: [ERROR]\n\n`);
    res.end();
  }
};
