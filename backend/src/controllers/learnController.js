import { Course } from "../models/Course.js";
import { Lesson } from "../models/Lesson.js";
import { Quiz } from "../models/Quiz.js";
import { Enrollment } from "../models/Enrollment.js";
import { QuizAttempt } from "../models/QuizAttempt.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { progressService } from "../services/progressService.js";
import { quizService } from "../services/quizService.js";
import { activityService } from "../services/activityService.js";

export const getLearnerCourseView = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const studentId = req.user._id;

  const course = await Course.findById(id)
    .populate("mentor", "name avatarUrl mentorProfile")
    .populate("category", "name slug")
    .lean();

  if (!course) {
    return next(new AppError(404, "Course not found."));
  }

  const isMentor =
    course.mentor._id.toString() === studentId.toString();
  const isAdmin = req.user.roles.includes("admin");

  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: course._id,
  }).lean();

  if (!enrollment && !isMentor && !isAdmin) {
    return next(
      new AppError(
        403,
        "You must be enrolled in this course to view the learning space."
      )
    );
  }

  const [lessons, quizzes] = await Promise.all([
    Lesson.find({ course: course._id, isPublished: true })
      .sort({ order: 1 })
      .lean(),
    Quiz.find({ course: course._id, isPublished: true })
      .sort({ createdAt: 1 })
      .select("-questions.correctIndex -questions.explanation")
      .lean(),
  ]);

  const completedLessonSet = new Set(
    (enrollment?.completedLessons || []).map((id) => id.toString())
  );
  const passedQuizSet = new Set(
    (enrollment?.passedQuizzes || []).map((id) => id.toString())
  );

  const lessonsWithStatus = lessons.map((l) => ({
    ...l,
    isCompleted: completedLessonSet.has(l._id.toString()),
  }));

  const quizzesWithStatus = quizzes.map((q) => ({
    ...q,
    isPassed: passedQuizSet.has(q._id.toString()),
  }));

  // Determine resume point: lastLesson or first incomplete lesson
  let resumeLessonId = enrollment?.lastLesson || null;
  if (!resumeLessonId) {
    const firstIncomplete = lessonsWithStatus.find((l) => !l.isCompleted);
    resumeLessonId = firstIncomplete ? firstIncomplete._id : lessons[0]?._id;
  }

  res.status(200).json({
    success: true,
    data: {
      course,
      enrollment: enrollment || {
        status: "mentor_or_admin",
        progressPercent: 100,
        completedLessons: [],
        passedQuizzes: [],
      },
      lessons: lessonsWithStatus,
      quizzes: quizzesWithStatus,
      resumeLessonId,
    },
  });
});

export const getLessonContent = asyncHandler(async (req, res, next) => {
  const { lessonId } = req.params;
  const studentId = req.user ? req.user._id : null;

  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson || !lesson.isPublished) {
    return next(new AppError(404, "Lesson not found or not published."));
  }

  // If free preview, anyone (even unauthenticated) can view
  if (lesson.isFreePreview) {
    return res.status(200).json({
      success: true,
      data: lesson,
    });
  }

  // Otherwise, user must be logged in and enrolled (or mentor/admin)
  if (!req.user) {
    return next(
      new AppError(401, "Please log in to access this lesson content.")
    );
  }

  const course = await Course.findById(lesson.course);
  const isMentor =
    course && course.mentor.toString() === studentId.toString();
  const isAdmin = req.user.roles.includes("admin");

  if (!isMentor && !isAdmin) {
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: lesson.course,
    });

    if (!enrollment) {
      return next(
        new AppError(
          403,
          "You must be enrolled in this course to access this lesson."
        )
      );
    }
  }

  res.status(200).json({
    success: true,
    data: lesson,
  });
});

export const markLessonComplete = asyncHandler(async (req, res, next) => {
  const { lessonId } = req.params;
  const studentId = req.user._id;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    return next(new AppError(404, "Lesson not found."));
  }

  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: lesson.course,
  });

  if (!enrollment) {
    return next(
      new AppError(403, "You are not enrolled in this course.")
    );
  }

  const alreadyCompleted = enrollment.completedLessons.some(
    (id) => id.toString() === lessonId.toString()
  );

  if (!alreadyCompleted) {
    enrollment.completedLessons.push(lesson._id);
  }

  enrollment.lastLesson = lesson._id;
  await enrollment.save();

  // Recompute progress
  const updatedEnrollment = await progressService.recomputeProgress(
    studentId,
    lesson.course
  );

  if (!alreadyCompleted) {
    activityService.log({
      userId: studentId,
      type: "lesson_completed",
      courseId: lesson.course,
      refId: lesson._id,
      message: `Completed lesson: "${lesson.title}"`,
    });
  }

  res.status(200).json({
    success: true,
    message: "Lesson marked as complete",
    data: updatedEnrollment,
  });
});

export const unmarkLessonComplete = asyncHandler(async (req, res, next) => {
  const { lessonId } = req.params;
  const studentId = req.user._id;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    return next(new AppError(404, "Lesson not found."));
  }

  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: lesson.course,
  });

  if (!enrollment) {
    return next(
      new AppError(403, "You are not enrolled in this course.")
    );
  }

  enrollment.completedLessons = enrollment.completedLessons.filter(
    (id) => id.toString() !== lessonId.toString()
  );

  await enrollment.save();
  const updatedEnrollment = await progressService.recomputeProgress(
    studentId,
    lesson.course
  );

  res.status(200).json({
    success: true,
    message: "Lesson marked as incomplete",
    data: updatedEnrollment,
  });
});

export const getLearnerQuiz = asyncHandler(async (req, res, next) => {
  const { quizId } = req.params;
  const studentId = req.user._id;

  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz || !quiz.isPublished) {
    return next(new AppError(404, "Quiz not found."));
  }

  // Check enrollment
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: quiz.course,
  });

  if (!enrollment) {
    return next(
      new AppError(403, "You must be enrolled in the course to take this quiz.")
    );
  }

  const attemptsCount = await QuizAttempt.countDocuments({
    quiz: quiz._id,
    student: studentId,
  });

  const attemptsLeft =
    quiz.maxAttempts !== null && quiz.maxAttempts !== undefined
      ? Math.max(0, quiz.maxAttempts - attemptsCount)
      : null;

  // Sanitize questions by stripping correctIndex and explanation
  const sanitizedQuestions = quiz.questions.map((q) => ({
    _id: q._id,
    text: q.text,
    options: q.options,
  }));

  res.status(200).json({
    success: true,
    data: {
      _id: quiz._id,
      course: quiz.course,
      sectionId: quiz.sectionId,
      title: quiz.title,
      instructions: quiz.instructions,
      passPercent: quiz.passPercent,
      maxAttempts: quiz.maxAttempts,
      isRequired: quiz.isRequired,
      attemptsUsed: attemptsCount,
      attemptsLeft,
      questions: sanitizedQuestions,
    },
  });
});

export const submitQuizAttempt = asyncHandler(async (req, res, next) => {
  const { quizId } = req.params;
  const { answers } = req.body;
  const studentId = req.user._id;

  const result = await quizService.submitAttempt({
    quizId,
    studentId,
    answers,
  });

  res.status(200).json({
    success: true,
    message: result.passed
      ? "Congratulations! You passed the quiz."
      : "Quiz completed. Keep studying and try again!",
    data: result,
  });
});

export const getMyQuizAttempts = asyncHandler(async (req, res, next) => {
  const { quizId } = req.params;
  const studentId = req.user._id;

  const attempts = await QuizAttempt.find({
    quiz: quizId,
    student: studentId,
  })
    .sort({ submittedAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: attempts,
  });
});
