import crypto from "crypto";
import { Enrollment } from "../models/Enrollment.js";
import { Lesson } from "../models/Lesson.js";
import { Quiz } from "../models/Quiz.js";
import { Course } from "../models/Course.js";
import { activityService } from "./activityService.js";
import { notificationService } from "./notificationService.js";

export const progressService = {
  recomputeProgress: async (studentId, courseId) => {
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (!enrollment) return null;

    // 1. Fetch all currently published lessons and published required quizzes for this course
    const [publishedLessons, publishedRequiredQuizzes, course] =
      await Promise.all([
        Lesson.find({ course: courseId, isPublished: true }).select("_id"),
        Quiz.find({
          course: courseId,
          isPublished: true,
          isRequired: true,
        }).select("_id"),
        Course.findById(courseId).select("title"),
      ]);

    const publishedLessonIds = new Set(
      publishedLessons.map((l) => l._id.toString())
    );
    const publishedQuizIds = new Set(
      publishedRequiredQuizzes.map((q) => q._id.toString())
    );

    const totalItems = publishedLessonIds.size + publishedQuizIds.size;

    if (totalItems === 0) {
      enrollment.progressPercent = 0;
      await enrollment.save();
      return enrollment;
    }

    // 2. Count valid completed lessons (ignoring deleted/unpublished lessons)
    const validCompletedLessonsCount = (
      enrollment.completedLessons || []
    ).filter((lessonId) =>
      publishedLessonIds.has(lessonId.toString())
    ).length;

    // 3. Count valid passed quizzes (ignoring deleted/unpublished quizzes)
    const validPassedQuizzesCount = (
      enrollment.passedQuizzes || []
    ).filter((quizId) => publishedQuizIds.has(quizId.toString())).length;

    const doneItems = validCompletedLessonsCount + validPassedQuizzesCount;
    const progressPercent = Math.min(
      100,
      Math.round((doneItems / totalItems) * 100)
    );

    enrollment.progressPercent = progressPercent;

    // If progress dropped below 100% (e.g. a lesson was un-marked), reopen the course
    if (progressPercent < 100 && enrollment.status === "completed") {
      enrollment.status = "active";
      enrollment.completedAt = undefined;
    }
    // 4. Handle course completion
    if (progressPercent === 100 && enrollment.status !== "completed") {
      enrollment.status = "completed";
      enrollment.completedAt = new Date();

      if (!enrollment.certificateCode) {
        enrollment.certificateCode = `EDU-${crypto
          .randomBytes(4)
          .toString("hex")
          .toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      }

      const courseTitle = course?.title || "the course";

      // Log activity & notify
      activityService.log({
        userId: studentId,
        type: "course_completed",
        courseId,
        refId: enrollment._id,
        message: `Completed the course "${courseTitle}" with 100% progress`,
      });

      notificationService.notify({
        userId: studentId,
        type: "course_completed",
        message: `Congratulations! You have completed "${courseTitle}". Your certificate is now ready!`,
        courseId,
      });
    }

    await enrollment.save();
    return enrollment;
  },
};
