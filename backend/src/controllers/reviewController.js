import { Review } from "../models/Review.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { courseService } from "../services/courseService.js";
import { notificationService } from "../services/notificationService.js";
import {
  getPaginationParams,
  formatPaginatedResponse,
} from "../utils/pagination.js";

export const getCourseReviews = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { page, limit, skip } = getPaginationParams(req.query, 10, 50);

  const [reviews, total] = await Promise.all([
    Review.find({ course: id })
      .populate("student", "name avatarUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ course: id }),
  ]);

  res.status(200).json(formatPaginatedResponse(reviews, total, page, limit));
});

export const createOrUpdateReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // courseId
  const studentId = req.user._id;
  const rating = Number(req.body.rating);
  const comment =
    typeof req.body.comment === "string" ? req.body.comment : undefined;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return next(new AppError(400, "Rating must be an integer between 1 and 5."));
  }

  const course = await Course.findById(id);
  if (!course) {
    return next(new AppError(404, "Course not found."));
  }

  // Mentor cannot review their own course
  if (course.mentor.toString() === studentId.toString()) {
    return next(
      new AppError(403, "You cannot submit a review for your own course.")
    );
  }

  // Must be enrolled
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: id,
  });

  if (!enrollment) {
    return next(
      new AppError(403, "You must be enrolled in this course to leave a review.")
    );
  }

  // Check 25% progress gate
  if ((enrollment.progressPercent || 0) < 25) {
    return next(
      new AppError(
        400,
        "You must complete at least 25% of the course before leaving a review."
      )
    );
  }

  let review = await Review.findOne({ course: id, student: studentId });

  if (review) {
    review.rating = rating;
    review.comment = comment !== undefined ? comment.trim() : review.comment;
    await review.save();
  } else {
    review = await Review.create({
      course: id,
      student: studentId,
      rating,
      comment: comment ? comment.trim() : "",
    });

    notificationService.notify({
      userId: course.mentor,
      type: "new_review",
      message: `${req.user.name} left a ${rating}-star review on "${course.title}".`,
      courseId: course._id,
    });
  }

  await courseService.recomputeCourseStats(id);

  res.status(200).json({
    success: true,
    message: "Review saved successfully",
    data: review,
  });
});

export const deleteMyReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // courseId
  const studentId = req.user._id;

  const review = await Review.findOneAndDelete({
    course: id,
    student: studentId,
  });

  if (!review) {
    return next(new AppError(404, "Review not found."));
  }

  await courseService.recomputeCourseStats(id);

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});

export const replyToReview = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return next(new AppError(400, "Reply text is required."));
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    return next(new AppError(404, "Review not found."));
  }

  const course = await Course.findById(review.course);
  const isOwner =
    course &&
    (course.mentor.toString() === req.user._id.toString() ||
      req.user.roles.includes("admin"));

  if (!isOwner) {
    return next(
      new AppError(403, "Only the course mentor can reply to this review.")
    );
  }

  review.mentorReply = {
    text: text.trim(),
    repliedAt: new Date(),
  };

  await review.save();

  notificationService.notify({
    userId: review.student,
    type: "mentor_reply",
    message: `The instructor replied to your review on "${course.title}".`,
    courseId: course._id,
  });

  res.status(200).json({
    success: true,
    message: "Reply posted successfully",
    data: review,
  });
});
