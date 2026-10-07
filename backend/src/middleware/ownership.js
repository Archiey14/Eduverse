import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const loadOwnedCourse = asyncHandler(async (req, res, next) => {
  const courseId = req.params.id || req.params.courseId;

  if (!courseId) {
    return next(new AppError(400, "Course ID parameter is missing."));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError(404, "Course not found."));
  }

  const isMentorOwner =
    course.mentor.toString() === req.user._id.toString();
  const isAdmin = req.user.roles && req.user.roles.includes("admin");

  if (!isMentorOwner && !isAdmin) {
    return next(
      new AppError(
        403,
        "Access denied. You are not authorized to modify or access this course."
      )
    );
  }

  req.course = course;
  next();
});

export const requireCourseAccess = asyncHandler(async (req, res, next) => {
  const courseId = req.params.id || req.params.courseId;

  if (!courseId) {
    return next(new AppError(400, "Course ID parameter is missing."));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError(404, "Course not found."));
  }

  const isMentorOwner =
    course.mentor.toString() === req.user._id.toString();
  const isAdmin = req.user.roles && req.user.roles.includes("admin");

  if (isMentorOwner || isAdmin) {
    req.course = course;
    return next();
  }

  // Check student enrollment
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: course._id,
  });

  if (!enrollment) {
    return next(
      new AppError(
        403,
        "Access denied. You must be enrolled in this course to access its content."
      )
    );
  }

  req.course = course;
  req.enrollment = enrollment;
  next();
});
