import mongoose from "mongoose";
import { Course } from "../models/Course.js";
import { Lesson } from "../models/Lesson.js";
import { Quiz } from "../models/Quiz.js";
import { Category } from "../models/Category.js";
import { Enrollment } from "../models/Enrollment.js";
import { Review } from "../models/Review.js";
import { QuizAttempt } from "../models/QuizAttempt.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { slugify } from "../utils/slugify.js";
import { escapeRegex } from "../utils/sanitize.js";
import { courseService } from "../services/courseService.js";
import { activityService } from "../services/activityService.js";
import {
  getPaginationParams,
  formatPaginatedResponse,
} from "../utils/pagination.js";

// Accepts a category ObjectId, name or slug. Returns null when nothing matches
// (the old code silently fell back to an arbitrary category).
const resolveCategoryId = async (value) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (!text || text === "[object Object]") return null;

  if (/^[a-f\d]{24}$/i.test(text)) {
    const byId = await Category.findById(text);
    if (byId) return byId._id;
  }

  const byNameOrSlug = await Category.findOne({
    $or: [
      { name: new RegExp(`^${escapeRegex(text)}$`, "i") },
      { slug: slugify(text) },
    ],
  });
  return byNameOrSlug ? byNameOrSlug._id : null;
};

export const getMentorDashboard = asyncHandler(async (req, res, next) => {
  const mentorId = req.user._id;

  const courses = await Course.find({ mentor: mentorId })
    .populate("category", "name slug")
    .sort({ updatedAt: -1 })
    .lean();
  const courseIds = courses.map((c) => c._id);

  let totalEnrollments = 0;
  let totalRatingSum = 0;
  let totalReviews = 0;

  courses.forEach((c) => {
    totalEnrollments += c.stats?.enrollmentCount || 0;
    if (c.stats?.ratingCount > 0) {
      totalRatingSum += (c.stats.ratingAvg || 0) * c.stats.ratingCount;
      totalReviews += c.stats.ratingCount;
    }
  });

  const overallRating =
    totalReviews > 0
      ? Math.round((totalRatingSum / totalReviews) * 10) / 10
      : 0;

  const [recentEnrollments, recentReviews] = await Promise.all([
    Enrollment.find({ course: { $in: courseIds } })
      .populate("student", "name email avatarUrl")
      .populate("course", "title")
      .sort({ enrolledAt: -1 })
      .limit(10)
      .lean(),
    Review.find({ course: { $in: courseIds } })
      .populate("student", "name avatarUrl")
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalCourses: courses.length,
        publishedCourses: courses.filter((c) => c.status === "published")
          .length,
        draftCourses: courses.filter((c) => c.status === "draft").length,
        totalEnrollments,
        totalReviews,
        overallRating,
      },
      recentEnrollments,
      recentReviews,
      courses,
    },
  });
});

export const getMentorAnalytics = asyncHandler(async (req, res, next) => {
  const mentorId = req.user._id;

  const courses = await Course.find({ mentor: mentorId })
    .select("title status stats")
    .lean();
  const courseIds = courses.map((c) => c._id);

  // First day of the month, 5 months ago (so we cover the last 6 calendar months)
  const now = new Date();
  const windowStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [enrollmentAgg, quizAgg, monthlyAgg, quizzes] = await Promise.all([
    Enrollment.aggregate([
      { $match: { course: { $in: courseIds } } },
      {
        $group: {
          _id: "$course",
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          avgProgress: { $avg: "$progressPercent" },
        },
      },
    ]),
    QuizAttempt.aggregate([
      { $match: { course: { $in: courseIds } } },
      {
        $group: {
          _id: "$quiz",
          attempts: { $sum: 1 },
          avgScore: { $avg: "$scorePercent" },
          passed: { $sum: { $cond: ["$passed", 1, 0] } },
        },
      },
    ]),
    Enrollment.aggregate([
      {
        $match: {
          course: { $in: courseIds },
          enrolledAt: { $gte: windowStart },
        },
      },
      {
        $group: {
          _id: { y: { $year: "$enrolledAt" }, m: { $month: "$enrolledAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
    Quiz.find({ course: { $in: courseIds } })
      .select("title course")
      .populate("course", "title")
      .lean(),
  ]);

  const enrollmentByCourse = new Map(
    enrollmentAgg.map((row) => [String(row._id), row])
  );
  const attemptsByQuiz = new Map(quizAgg.map((row) => [String(row._id), row]));

  const courseRows = courses.map((c) => {
    const row = enrollmentByCourse.get(String(c._id));
    const students = row?.total || 0;
    const completed = row?.completed || 0;
    return {
      _id: c._id,
      title: c.title,
      status: c.status,
      students,
      completed,
      completionRate: students > 0 ? Math.round((completed / students) * 100) : 0,
      avgProgress: Math.round(row?.avgProgress || 0),
      rating: c.stats?.ratingAvg || 0,
      ratingCount: c.stats?.ratingCount || 0,
    };
  });

  const quizRows = quizzes.map((q) => {
    const row = attemptsByQuiz.get(String(q._id));
    const attempts = row?.attempts || 0;
    return {
      _id: q._id,
      title: q.title,
      course: q.course?.title || "",
      attempts,
      avgScore: Math.round(row?.avgScore || 0),
      passRate: attempts > 0 ? Math.round(((row?.passed || 0) / attempts) * 100) : 0,
    };
  });

  const monthCounts = new Map(
    monthlyAgg.map((row) => [`${row._id.y}-${row._id.m}`, row.count])
  );
  const monthly = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthly.push({
      label: d.toLocaleString("en-US", { month: "short" }),
      count: monthCounts.get(`${d.getFullYear()}-${d.getMonth() + 1}`) || 0,
    });
  }

  const totalStudents = courseRows.reduce((sum, c) => sum + c.students, 0);
  const totalCompleted = courseRows.reduce((sum, c) => sum + c.completed, 0);
  const ratingCount = courseRows.reduce((sum, c) => sum + c.ratingCount, 0);
  const ratingSum = courseRows.reduce(
    (sum, c) => sum + c.rating * c.ratingCount,
    0
  );

  res.status(200).json({
    success: true,
    data: {
      totals: {
        students: totalStudents,
        completions: totalCompleted,
        completionRate:
          totalStudents > 0 ? Math.round((totalCompleted / totalStudents) * 100) : 0,
        avgRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
        ratingCount,
      },
      courses: courseRows,
      quizzes: quizRows,
      monthly,
    },
  });
});

export const createDraftCourse = asyncHandler(async (req, res, next) => {
  const {
    title,
    subtitle,
    description,
    category,
    level,
    language,
    thumbnailUrl,
    previewVideoUrl,
    learningOutcomes,
    requirements,
  } = req.body;

  if (!title || !description || !category) {
    return next(
      new AppError(400, "Please provide title, description, and category.")
    );
  }

  const categoryId = await resolveCategoryId(category);
  if (!categoryId) {
    return next(new AppError(400, "Invalid category specified."));
  }

  const allowedLevels = ["beginner", "intermediate", "advanced"];
  const normalizedLevel = level ? String(level).trim().toLowerCase() : "beginner";
  if (!allowedLevels.includes(normalizedLevel)) {
    return next(
      new AppError(400, "Level must be beginner, intermediate or advanced.")
    );
  }

  let slug = slugify(title);
  const existingSlug = await Course.findOne({ slug });
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const course = await Course.create({
    mentor: req.user._id,
    title: title.trim(),
    slug,
    subtitle: subtitle || "",
    description: description.trim(),
    category: categoryId,
    level: normalizedLevel,
    language: language || "English",
    thumbnailUrl: thumbnailUrl || "",
    previewVideoUrl: previewVideoUrl || "",
    learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes : [],
    requirements: Array.isArray(requirements) ? requirements : [],
    sections: [{ title: "Section 1: Introduction", order: 1 }],
    status: "draft",
  });

  res.status(201).json({
    success: true,
    message: "Course draft created successfully",
    data: course,
  });
});

export const getMyCourses = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPaginationParams(req.query, 20, 50);
  const filter = { mentor: req.user._id };

  // Only accept a known status string (blocks ?status[$ne]=x style injection)
  const status = req.query.status;
  if (
    typeof status === "string" &&
    ["draft", "published", "archived"].includes(status)
  ) {
    filter.status = status;
  }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("category", "name slug")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments(filter),
  ]);

  res.status(200).json(formatPaginatedResponse(courses, total, page, limit));
});

export const getMyCourseById = asyncHandler(async (req, res, next) => {
  const course = req.course; // Attached by loadOwnedCourse middleware

  const [lessons, quizzes] = await Promise.all([
    Lesson.find({ course: course._id }).sort({ order: 1 }).lean(),
    Quiz.find({ course: course._id }).sort({ createdAt: 1 }).lean(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...course.toObject(),
      lessons,
      quizzes,
    },
  });
});

export const updateCourse = asyncHandler(async (req, res, next) => {
  const course = req.course;

  const allowedFields = [
    "title",
    "subtitle",
    "description",
    "category",
    "level",
    "language",
    "thumbnailUrl",
    "previewVideoUrl",
    "learningOutcomes",
    "requirements",
  ];

  allowedFields.forEach((field) => {
    if (field !== "category" && req.body[field] !== undefined) {
      course[field] = req.body[field];
    }
  });

  if (req.body.category !== undefined) {
    let catVal = req.body.category;
    if (typeof catVal === "object" && catVal?._id) catVal = catVal._id;
    const catId = await resolveCategoryId(catVal);
    if (!catId) {
      return next(new AppError(400, "Invalid category specified."));
    }
    course.category = catId;
  }

  if (req.body.title && req.body.title !== course.title) {
    let slug = slugify(req.body.title);
    const existingSlug = await Course.findOne({
      slug,
      _id: { $ne: course._id },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    course.slug = slug;
  }

  await course.save();
  await courseService.recomputeCourseStats(course._id);

  res.status(200).json({
    success: true,
    message: "Course updated successfully",
    data: course,
  });
});

export const deleteCourse = asyncHandler(async (req, res, next) => {
  const course = req.course;

  const enrollmentCount = await Enrollment.countDocuments({
    course: course._id,
  });

  if (enrollmentCount > 0) {
    // If students are enrolled, archive rather than hard-delete
    course.status = "archived";
    await course.save();

    return res.status(200).json({
      success: true,
      message:
        "Course has active enrollments and cannot be hard deleted. It has been archived.",
      status: "archived",
    });
  }

  // Safe to delete related lessons, quizzes, and course
  await Promise.all([
    Lesson.deleteMany({ course: course._id }),
    Quiz.deleteMany({ course: course._id }),
    Course.findByIdAndDelete(course._id),
  ]);

  res.status(200).json({
    success: true,
    message: "Course and related curriculum items deleted successfully.",
  });
});

export const publishCourse = asyncHandler(async (req, res, next) => {
  const course = req.course;

  // Validate publishing requirements
  await courseService.validateForPublish(course._id);

  course.status = "published";
  course.publishedAt = new Date();
  await course.save();
  await courseService.recomputeCourseStats(course._id);

  activityService.log({
    userId: req.user._id,
    type: "course_published",
    courseId: course._id,
    message: `Published course: ${course.title}`,
  });

  res.status(200).json({
    success: true,
    message: "Course published successfully and is now live in the catalog!",
    data: course,
  });
});

export const unpublishCourse = asyncHandler(async (req, res, next) => {
  const course = req.course;

  course.status = "draft";
  await course.save();

  res.status(200).json({
    success: true,
    message:
      "Course unpublished and reverted to draft. Existing enrolled students retain access.",
    data: course,
  });
});

export const getCourseStudents = asyncHandler(async (req, res, next) => {
  const course = req.course;
  const { page, limit, skip } = getPaginationParams(req.query, 20, 50);

  const [enrollments, total] = await Promise.all([
    Enrollment.find({ course: course._id })
      .populate("student", "name email avatarUrl")
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Enrollment.countDocuments({ course: course._id }),
  ]);

  res.status(200).json(formatPaginatedResponse(enrollments, total, page, limit));
});

export const getCourseStudentDetail = asyncHandler(async (req, res, next) => {
  const course = req.course;
  const { studentId } = req.params;

  const [enrollment, attempts] = await Promise.all([
    Enrollment.findOne({
      course: course._id,
      student: studentId,
    })
      .populate("student", "name email avatarUrl")
      .populate("lastLesson", "title")
      .lean(),
    QuizAttempt.find({
      course: course._id,
      student: studentId,
    })
      .populate("quiz", "title passPercent")
      .sort({ submittedAt: -1 })
      .lean(),
  ]);

  if (!enrollment) {
    return next(
      new AppError(404, "Student enrollment not found for this course.")
    );
  }

  res.status(200).json({
    success: true,
    data: {
      enrollment,
      quizAttempts: attempts,
    },
  });
});
