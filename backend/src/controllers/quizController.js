import { Quiz } from "../models/Quiz.js";
import { Course } from "../models/Course.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { courseService } from "../services/courseService.js";

export const createQuiz = asyncHandler(async (req, res, next) => {
  const course = req.course;
  const {
    sectionId,
    title,
    instructions,
    passPercent,
    maxAttempts,
    isRequired,
    isPublished,
    questions,
  } = req.body;

  if (!title) {
    return next(new AppError(400, "Quiz title is required."));
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return next(
      new AppError(400, "A quiz must have at least one question.")
    );
  }

  // Validate questions structure
  for (const [idx, q] of questions.entries()) {
    if (!q.text) {
      return next(
        new AppError(400, `Question #${idx + 1} is missing question text.`)
      );
    }
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 6) {
      return next(
        new AppError(
          400,
          `Question #${idx + 1} must have between 2 and 6 options.`
        )
      );
    }
    if (
      q.correctIndex === undefined ||
      q.correctIndex < 0 ||
      q.correctIndex >= q.options.length
    ) {
      return next(
        new AppError(
          400,
          `Question #${idx + 1} has an invalid correctIndex.`
        )
      );
    }
  }

  const quiz = await Quiz.create({
    course: course._id,
    sectionId: sectionId || undefined,
    title: title.trim(),
    instructions: instructions || "",
    passPercent: passPercent !== undefined ? passPercent : 70,
    maxAttempts: maxAttempts !== undefined ? maxAttempts : null,
    isRequired: isRequired !== undefined ? isRequired : true,
    isPublished: isPublished !== undefined ? isPublished : true,
    questions,
  });

  await courseService.recomputeCourseStats(course._id);

  res.status(201).json({
    success: true,
    message: "Quiz created successfully",
    data: quiz,
  });
});

export const getQuizById = asyncHandler(async (req, res, next) => {
  const { quizId } = req.params;
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    return next(new AppError(404, "Quiz not found."));
  }

  const course = await Course.findById(quiz.course);
  const isOwner =
    course &&
    (course.mentor.toString() === req.user._id.toString() ||
      req.user.roles.includes("admin"));

  if (!isOwner) {
    return next(
      new AppError(403, "Access denied. You do not own this course's quiz.")
    );
  }

  res.status(200).json({
    success: true,
    data: quiz,
  });
});

export const updateQuiz = asyncHandler(async (req, res, next) => {
  const { quizId } = req.params;
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    return next(new AppError(404, "Quiz not found."));
  }

  const course = await Course.findById(quiz.course);
  const isOwner =
    course &&
    (course.mentor.toString() === req.user._id.toString() ||
      req.user.roles.includes("admin"));

  if (!isOwner) {
    return next(
      new AppError(403, "Access denied. You do not own this course's quiz.")
    );
  }

  const allowedFields = [
    "sectionId",
    "title",
    "instructions",
    "passPercent",
    "maxAttempts",
    "isRequired",
    "isPublished",
    "questions",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      quiz[field] = req.body[field];
    }
  });

  await quiz.save();
  await courseService.recomputeCourseStats(course._id);

  res.status(200).json({
    success: true,
    message: "Quiz updated successfully",
    data: quiz,
  });
});

export const deleteQuiz = asyncHandler(async (req, res, next) => {
  const { quizId } = req.params;
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    return next(new AppError(404, "Quiz not found."));
  }

  const course = await Course.findById(quiz.course);
  const isOwner =
    course &&
    (course.mentor.toString() === req.user._id.toString() ||
      req.user.roles.includes("admin"));

  if (!isOwner) {
    return next(
      new AppError(403, "Access denied. You do not own this course's quiz.")
    );
  }

  await Quiz.findByIdAndDelete(quizId);
  await courseService.recomputeCourseStats(course._id);

  res.status(200).json({
    success: true,
    message: "Quiz deleted successfully",
  });
});
