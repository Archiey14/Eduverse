import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getPaginationParams,
  formatPaginatedResponse,
} from "../utils/pagination.js";

export const getAdminStats = asyncHandler(async (req, res, next) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalUsers,
    totalMentors,
    totalCourses,
    totalEnrollments,
    recentSignups,
    topCourses,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ roles: "mentor" }),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Course.find({ status: "published" })
      .sort({ "stats.enrollmentCount": -1 })
      .limit(5)
      .select("title slug stats category mentor")
      .populate("mentor", "name")
      .populate("category", "name")
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalMentors,
      totalCourses,
      totalEnrollments,
      recentSignups7d: recentSignups,
      topCourses,
    },
  });
});

export const getAdminUsers = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPaginationParams(req.query, 20, 100);
  const { search, role, isActive } = req.query;

  const filter = {};
  if (role) filter.roles = role;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) {
    filter.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { email: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  res.status(200).json(formatPaginatedResponse(users, total, page, limit));
});

export const updateAdminUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { roles, isActive } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError(404, "User not found."));
  }

  if (Array.isArray(roles)) {
    user.roles = roles;
  }
  if (isActive !== undefined) {
    user.isActive = Boolean(isActive);
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
    },
  });
});

export const getAdminCourses = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPaginationParams(req.query, 20, 100);
  const { status, category, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (search) {
    filter.title = { $regex: search.trim(), $options: "i" };
  }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("mentor", "name email")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments(filter),
  ]);

  res.status(200).json(formatPaginatedResponse(courses, total, page, limit));
});

export const updateAdminCourseStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["draft", "published", "archived"].includes(status)) {
    return next(
      new AppError(
        400,
        "Status must be one of: 'draft', 'published', or 'archived'."
      )
    );
  }

  const course = await Course.findById(id);
  if (!course) {
    return next(new AppError(404, "Course not found."));
  }

  course.status = status;
  if (status === "published" && !course.publishedAt) {
    course.publishedAt = new Date();
  }

  await course.save();

  res.status(200).json({
    success: true,
    message: `Course status updated to ${status}`,
    data: course,
  });
});

export const getAdminEnrollments = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPaginationParams(req.query, 20, 100);

  const [enrollments, total] = await Promise.all([
    Enrollment.find()
      .populate("student", "name email")
      .populate("course", "title slug")
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Enrollment.countDocuments(),
  ]);

  res.status(200).json(formatPaginatedResponse(enrollments, total, page, limit));
});
