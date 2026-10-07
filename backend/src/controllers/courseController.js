import mongoose from "mongoose";
import { Course } from "../models/Course.js";
import { Lesson } from "../models/Lesson.js";
import { Quiz } from "../models/Quiz.js";
import { Category } from "../models/Category.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { escapeRegex, asString } from "../utils/sanitize.js";
import {
  getPaginationParams,
  formatPaginatedResponse,
} from "../utils/pagination.js";

// Only treat a value as an ObjectId when it is a real 24-char hex string.
// (mongoose.isValid() also accepts any 12-character string, e.g. a slug.)
const isObjectIdString = (value) => /^[a-f\d]{24}$/i.test(value);

export const getCourses = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPaginationParams(req.query, 12, 50);
  const search = asString(req.query.search);
  const category = asString(req.query.category);
  const level = asString(req.query.level);
  const language = asString(req.query.language);
  const sort = asString(req.query.sort);

  const filter = { status: "published" };

  // Category filter (support category ObjectId or slug)
  if (category) {
    if (isObjectIdString(category)) {
      filter.category = category;
    } else {
      const catDoc = await Category.findOne({ slug: category });
      if (catDoc) {
        filter.category = catDoc._id;
      } else {
        return res
          .status(200)
          .json(formatPaginatedResponse([], 0, page, limit));
      }
    }
  }

  // Level & Language filters
  if (level) filter.level = level;
  if (language) filter.language = language;

  let sortOption = { createdAt: -1 }; // default newest

  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { title: { $regex: safeSearch, $options: "i" } },
      { subtitle: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } },
    ];
  }

  // Sorting
  if (sort === "rating") {
    sortOption = { "stats.ratingAvg": -1, "stats.ratingCount": -1 };
  } else if (sort === "popular") {
    sortOption = { "stats.enrollmentCount": -1 };
  } else if (sort === "newest") {
    sortOption = { publishedAt: -1, createdAt: -1 };
  }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("mentor", "name avatarUrl mentorProfile")
      .populate("category", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments(filter),
  ]);

  res.status(200).json(formatPaginatedResponse(courses, total, page, limit));
});

export const getCourseByIdOrSlug = asyncHandler(async (req, res, next) => {
  const idOrSlug = String(req.params.idOrSlug);

  const query = isObjectIdString(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug.toLowerCase() };

  const course = await Course.findOne(query)
    .populate("mentor", "name avatarUrl mentorProfile")
    .populate("category", "name slug")
    .lean();

  if (!course) {
    return next(new AppError(404, "Course not found."));
  }

  // If course is draft or archived, only its mentor or an admin can view it
  // (req.user is set by the optionalAuth middleware on this route).
  if (course.status !== "published") {
    const isMentor =
      !!req.user &&
      !!course.mentor &&
      course.mentor._id.toString() === req.user._id.toString();
    const isAdmin = !!req.user && !!req.user.roles?.includes("admin");

    if (!isMentor && !isAdmin) {
      return next(new AppError(404, "Course is not published."));
    }
  }

  // Fetch published lessons and quizzes for the course outline
  const [lessons, quizzes] = await Promise.all([
    Lesson.find({ course: course._id, isPublished: true })
      .sort({ order: 1 })
      .select(
        "title type durationMin order isFreePreview sectionId resources" +
          " " +
          "videoUrl content"
      )
      .lean(),
    Quiz.find({ course: course._id, isPublished: true })
      .sort({ createdAt: 1 })
      .select("title instructions passPercent maxAttempts isRequired sectionId")
      .lean(),
  ]);

  // Sanitize lessons so non-free preview lessons do not expose full videoUrl and content
  const sanitizedLessons = lessons.map((l) => {
    if (l.isFreePreview) {
      return l;
    }
    const { videoUrl, content, resources, ...rest } = l;
    return rest;
  });

  res.status(200).json({
    success: true,
    data: {
      ...course,
      lessons: sanitizedLessons,
      quizzes,
    },
  });
});
