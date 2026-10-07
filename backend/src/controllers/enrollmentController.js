import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { activityService } from "../services/activityService.js";
import { notificationService } from "../services/notificationService.js";
import { courseService } from "../services/courseService.js";

export const enrollCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.body;
  const studentId = req.user._id;

  if (!courseId) {
    return next(new AppError(400, "Course ID is required."));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError(404, "Course not found."));
  }

  if (course.status !== "published") {
    return next(
      new AppError(400, "Cannot enroll in a course that is not published.")
    );
  }

  // Business Rule: Mentor cannot enroll in their own course
  if (course.mentor.toString() === studentId.toString()) {
    return next(
      new AppError(403, "You cannot enroll in a course you created.")
    );
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (existingEnrollment) {
    return res.status(409).json({
      success: false,
      message: "You are already enrolled in this course.",
      enrollment: existingEnrollment,
    });
  }

  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    status: "active",
    enrolledAt: new Date(),
    progressPercent: 0,
    completedLessons: [],
    passedQuizzes: [],
  });

  // Increment course enrollment count & recompute stats
  await courseService.recomputeCourseStats(course._id);

  // Log activity & notify mentor
  activityService.log({
    userId: studentId,
    type: "enrolled",
    courseId: course._id,
    refId: enrollment._id,
    message: `Enrolled in course: "${course.title}"`,
  });

  notificationService.notify({
    userId: course.mentor,
    type: "new_enrollment",
    message: `${req.user.name} has enrolled in your course "${course.title}".`,
    courseId: course._id,
  });

  res.status(201).json({
    success: true,
    message: "Enrolled in course successfully",
    data: enrollment,
  });
});

export const getMyEnrollments = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const enrollments = await Enrollment.find({ student: studentId })
    .populate({
      path: "course",
      select:
        "title slug subtitle thumbnailUrl level language stats category mentor status",
      populate: [
        { path: "mentor", select: "name avatarUrl" },
        { path: "category", select: "name slug" },
      ],
    })
    .populate("lastLesson", "title")
    .sort({ updatedAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: enrollments,
  });
});

export const unenrollCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const studentId = req.user._id;

  const enrollment = await Enrollment.findOneAndDelete({
    student: studentId,
    course: courseId,
  });

  if (!enrollment) {
    return next(new AppError(404, "Enrollment not found."));
  }

  // Decrement course enrollment count & recompute stats
  await courseService.recomputeCourseStats(courseId);

  res.status(200).json({
    success: true,
    message:
      "Successfully unenrolled from course. Note that previous progress has been deleted.",
  });
});
