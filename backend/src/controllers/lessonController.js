import { Lesson } from "../models/Lesson.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { courseService } from "../services/courseService.js";
import { notificationService } from "./../services/notificationService.js";

export const addLesson = asyncHandler(async (req, res, next) => {
  const course = req.course;
  const {
    sectionId,
    title,
    type,
    videoUrl,
    content,
    durationMin,
    resources,
    isFreePreview,
    isPublished,
  } = req.body;

  if (!sectionId || !title) {
    return next(
      new AppError(400, "Please provide sectionId and lesson title.")
    );
  }

  const sectionExists = course.sections.some(
    (s) => s._id.toString() === sectionId.toString()
  );

  if (!sectionExists) {
    return next(
      new AppError(404, "Section does not exist on this course.")
    );
  }

  const lastLesson = await Lesson.findOne({
    course: course._id,
    sectionId,
  }).sort({ order: -1 });

  const nextOrder = lastLesson ? lastLesson.order + 1 : 1;

  const lesson = await Lesson.create({
    course: course._id,
    sectionId,
    title: title.trim(),
    type: type || "video",
    videoUrl: videoUrl || "",
    content: content || "",
    durationMin: durationMin || 0,
    resources: Array.isArray(resources) ? resources : [],
    order: nextOrder,
    isFreePreview: !!isFreePreview,
    isPublished: isPublished !== undefined ? isPublished : true,
  });

  await courseService.recomputeCourseStats(course._id);

  // If published, notify enrolled students
  if (lesson.isPublished) {
    const enrollments = await Enrollment.find({
      course: course._id,
      status: "active",
    }).select("student");

    if (enrollments.length > 0) {
      const notifications = enrollments.map((enr) => ({
        user: enr.student,
        type: "lesson_published",
        message: `New lesson added to ${course.title}: "${lesson.title}"`,
        course: course._id,
      }));
      notificationService.notifyMany(notifications);
    }
  }

  res.status(201).json({
    success: true,
    message: "Lesson added successfully",
    data: lesson,
  });
});

export const updateLesson = asyncHandler(async (req, res, next) => {
  const { lessonId } = req.params;
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    return next(new AppError(404, "Lesson not found."));
  }

  // Verify mentor owns the course that owns this lesson
  const course = await Course.findById(lesson.course);
  if (!course) {
    return next(new AppError(404, "Associated course not found."));
  }

  const isOwner =
    course.mentor.toString() === req.user._id.toString() ||
    req.user.roles.includes("admin");

  if (!isOwner) {
    return next(
      new AppError(403, "You do not have permission to edit this lesson.")
    );
  }

  const allowedFields = [
    "sectionId",
    "title",
    "type",
    "videoUrl",
    "content",
    "durationMin",
    "resources",
    "order",
    "isFreePreview",
    "isPublished",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      lesson[field] = req.body[field];
    }
  });

  await lesson.save();
  await courseService.recomputeCourseStats(course._id);

  res.status(200).json({
    success: true,
    message: "Lesson updated successfully",
    data: lesson,
  });
});

export const deleteLesson = asyncHandler(async (req, res, next) => {
  const { lessonId } = req.params;
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    return next(new AppError(404, "Lesson not found."));
  }

  const course = await Course.findById(lesson.course);
  if (!course) {
    return next(new AppError(404, "Associated course not found."));
  }

  const isOwner =
    course.mentor.toString() === req.user._id.toString() ||
    req.user.roles.includes("admin");

  if (!isOwner) {
    return next(
      new AppError(403, "You do not have permission to delete this lesson.")
    );
  }

  await Lesson.findByIdAndDelete(lessonId);
  await courseService.recomputeCourseStats(course._id);

  res.status(200).json({
    success: true,
    message: "Lesson deleted successfully",
  });
});

export const reorderLessons = asyncHandler(async (req, res, next) => {
  const course = req.course;
  const { lessonIds } = req.body;

  if (!Array.isArray(lessonIds)) {
    return next(
      new AppError(400, "Please provide an array of lessonIds in new order.")
    );
  }

  const bulkOps = lessonIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id, course: course._id },
      update: { order: index + 1 },
    },
  }));

  if (bulkOps.length > 0) {
    await Lesson.bulkWrite(bulkOps);
  }

  const updatedLessons = await Lesson.find({ course: course._id }).sort({
    order: 1,
  });

  res.status(200).json({
    success: true,
    message: "Lessons reordered successfully",
    data: updatedLessons,
  });
});
