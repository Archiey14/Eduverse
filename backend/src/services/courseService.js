import mongoose from "mongoose";
import { Course } from "../models/Course.js";
import { Lesson } from "../models/Lesson.js";
import { Quiz } from "../models/Quiz.js";
import { Review } from "../models/Review.js";
import { Enrollment } from "../models/Enrollment.js";
import { AppError } from "../utils/AppError.js";

export const courseService = {
  recomputeCourseStats: async (rawCourseId) => {
    // aggregate() does NOT auto-cast strings to ObjectIds (unlike find/count),
    // so always cast here. Callers may pass either a string or an ObjectId.
    const courseId = new mongoose.Types.ObjectId(rawCourseId);

    const [lessonStats, quizCount, ratingStats, enrollmentCount] =
      await Promise.all([
        Lesson.aggregate([
          { $match: { course: courseId, isPublished: true } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              totalDuration: { $sum: "$durationMin" },
            },
          },
        ]),
        Quiz.countDocuments({ course: courseId, isPublished: true }),
        Review.aggregate([
          { $match: { course: courseId } },
          {
            $group: {
              _id: null,
              avgRating: { $avg: "$rating" },
              count: { $sum: 1 },
            },
          },
        ]),
        Enrollment.countDocuments({ course: courseId }),
      ]);

    const lessonCount = lessonStats[0]?.count || 0;
    const totalDurationMin = lessonStats[0]?.totalDuration || 0;
    const ratingAvg = ratingStats[0]?.avgRating
      ? Math.round(ratingStats[0].avgRating * 10) / 10
      : 0;
    const ratingCount = ratingStats[0]?.count || 0;

    const updated = await Course.findByIdAndUpdate(
      courseId,
      {
        "stats.lessonCount": lessonCount,
        "stats.quizCount": quizCount,
        "stats.totalDurationMin": totalDurationMin,
        "stats.ratingAvg": ratingAvg,
        "stats.ratingCount": ratingCount,
        "stats.enrollmentCount": enrollmentCount,
      },
      { new: true }
    );

    return updated;
  },

  validateForPublish: async (courseId) => {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError(404, "Course not found");
    }

    const errors = [];

    if (!course.title || course.title.trim().length < 5) {
      errors.push("Course title must be at least 5 characters long.");
    }

    if (!course.description || course.description.trim().length < 50) {
      errors.push("Course description must be at least 50 characters long.");
    }

    if (!course.category) {
      errors.push("Course must belong to a category.");
    }

    if (!course.thumbnailUrl) {
      errors.push("Course must have a thumbnail image URL.");
    }

    if (!course.sections || course.sections.length < 1) {
      errors.push("Course must have at least one section.");
    }

    const publishedLessonsCount = await Lesson.countDocuments({
      course: courseId,
      isPublished: true,
    });

    if (publishedLessonsCount < 3) {
      errors.push(
        `Course must have at least 3 published lessons before publishing (currently has ${publishedLessonsCount}).`
      );
    }

    if (errors.length > 0) {
      throw new AppError(
        400,
        `Cannot publish course. Please resolve the following requirements:`,
        errors
      );
    }

    return true;
  },
};
