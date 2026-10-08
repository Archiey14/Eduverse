import { Enrollment } from "../models/Enrollment.js";
import { QuizAttempt } from "../models/QuizAttempt.js";
import { Activity } from "../models/Activity.js";
import { Lesson } from "../models/Lesson.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

  res.status(200).json({
    success: true,
    data: {
      stats: {
        enrolledCount: enrollments.length,
        activeCount: activeEnrollments.length,
        completedCount: completedEnrollments.length,
        passedQuizzesCount,
        hoursLearned: Math.round((totalMinutesLearned / 60) * 10) / 10,
      },
      continueLearning,
      activeEnrollments,
      completedEnrollments,
      recentQuizAttempts,
      recentActivities,
    },
  });
});
