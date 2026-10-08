import { Enrollment } from "../models/Enrollment.js";
import { QuizAttempt } from "../models/QuizAttempt.js";
import { Activity } from "../models/Activity.js";
import { Lesson } from "../models/Lesson.js";
import { Quiz } from "../models/Quiz.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/student/quizzes
// Every published quiz in the courses the learner is enrolled in, with the
// learner's own attempt history folded in.
export const getStudentQuizzes = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const enrollments = await Enrollment.find({ student: studentId })
    .select("course passedQuizzes")
    .lean();

  const courseIds = enrollments.map((e) => e.course);
  const passedSet = new Set(
    enrollments.flatMap((e) => (e.passedQuizzes || []).map((id) => String(id)))
  );

  const [quizzes, attemptAgg] = await Promise.all([
    Quiz.find({ course: { $in: courseIds }, isPublished: true })
      .select("title course passPercent maxAttempts questions._id createdAt")
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .lean(),
    QuizAttempt.aggregate([
      { $match: { student: studentId, course: { $in: courseIds } } },
      { $sort: { submittedAt: -1 } },
      {
        $group: {
          _id: "$quiz",
          attempts: { $sum: 1 },
          bestScore: { $max: "$scorePercent" },
          lastScore: { $first: "$scorePercent" },
          lastAttemptAt: { $first: "$submittedAt" },
          anyPassed: { $max: { $cond: ["$passed", 1, 0] } },
        },
      },
    ]),
  ]);

  const attemptsByQuiz = new Map(attemptAgg.map((row) => [String(row._id), row]));

  const data = quizzes.map((quiz) => {
    const row = attemptsByQuiz.get(String(quiz._id));
    const attempts = row?.attempts || 0;
    const passed = passedSet.has(String(quiz._id)) || row?.anyPassed === 1;

    return {
      _id: quiz._id,
      title: quiz.title,
      course: quiz.course
        ? { _id: quiz.course._id, title: quiz.course.title }
        : null,
      questionCount: quiz.questions?.length || 0,
      passPercent: quiz.passPercent,
      maxAttempts: quiz.maxAttempts ?? null,
      attempts,
      bestScore: attempts > 0 ? row.bestScore : null,
      lastScore: attempts > 0 ? row.lastScore : null,
      lastAttemptAt: row?.lastAttemptAt || null,
      status: passed ? "passed" : attempts > 0 ? "failed" : "upcoming",
    };
  });

  res.status(200).json({ success: true, data });
});

export const getStudentDashboard = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const [enrollments, recentQuizAttempts, recentActivities] =
    await Promise.all([
      Enrollment.find({ student: studentId })
        .populate({
          path: "course",
          select:
            "title slug subtitle thumbnailUrl level stats category mentor",
          populate: [
            { path: "mentor", select: "name avatarUrl" },
            { path: "category", select: "name slug" },
          ],
        })
        .populate("lastLesson", "title durationMin type")
        .sort({ updatedAt: -1 })
        .lean(),
      QuizAttempt.find({ student: studentId })
        .populate("quiz", "title passPercent")
        .populate("course", "title")
        .sort({ submittedAt: -1 })
        .limit(5)
        .lean(),
      Activity.find({ user: studentId })
        .populate("course", "title slug")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

  const activeEnrollments = enrollments.filter(
    (e) => e.status === "active"
  );
  const completedEnrollments = enrollments.filter(
    (e) => e.status === "completed"
  );

  // Calculate total completed lessons and learning minutes
  const allCompletedLessonIds = enrollments.flatMap(
    (e) => e.completedLessons || []
  );
  let totalMinutesLearned = 0;

  if (allCompletedLessonIds.length > 0) {
    const completedLessonsDocs = await Lesson.find({
      _id: { $in: allCompletedLessonIds },
    })
      .select("durationMin")
      .lean();

    totalMinutesLearned = completedLessonsDocs.reduce(
      (sum, l) => sum + (l.durationMin || 0),
      0
    );
  }

  const passedQuizzesCount = enrollments.reduce(
    (sum, e) => sum + (e.passedQuizzes?.length || 0),
    0
  );

  // Continue learning card: first active enrollment with a resume lesson
  const continueLearning = activeEnrollments.length > 0 ? activeEnrollments[0] : null;

  // Learning streak: consecutive days (ending today or yesterday) with any activity
  const activityDates = await Activity.find({ user: studentId })
    .select("createdAt")
    .sort({ createdAt: -1 })
    .limit(1000)
    .lean();
  const dayKey = (d) =>
    `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const activeDays = new Set(
    activityDates.map((a) => dayKey(new Date(a.createdAt)))
  );
  let streakDays = 0;
  const cursor = new Date();
  if (!activeDays.has(dayKey(cursor))) {
    // Streak is still alive if the learner was active yesterday
    cursor.setDate(cursor.getDate() - 1);
  }
  while (activeDays.has(dayKey(cursor))) {
    streakDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const bestAttempt = await QuizAttempt.findOne({ student: studentId })
    .sort({ scorePercent: -1 })
    .select("scorePercent")
    .lean();

  res.status(200).json({
    success: true,
    data: {
      stats: {
        enrolledCount: enrollments.length,
        activeCount: activeEnrollments.length,
        completedCount: completedEnrollments.length,
        passedQuizzesCount,
        hoursLearned: Math.round((totalMinutesLearned / 60) * 10) / 10,
        streakDays,
        lessonsCompleted: allCompletedLessonIds.length,
        bestQuizScore: bestAttempt?.scorePercent || 0,
      },
      continueLearning,
      activeEnrollments,
      completedEnrollments,
      recentQuizAttempts,
      recentActivities,
    },
  });
});
