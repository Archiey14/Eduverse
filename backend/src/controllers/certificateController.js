import { Enrollment } from "../models/Enrollment.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyCertificate = asyncHandler(async (req, res, next) => {
  const { code } = req.params;

  const enrollment = await Enrollment.findOne({
    certificateCode: code.toUpperCase().trim(),
    status: "completed",
  })
    .populate("student", "name avatarUrl")
    .populate("course", "title slug thumbnailUrl mentor")
    .populate({
      path: "course",
      populate: { path: "mentor", select: "name mentorProfile" },
    })
    .lean();

  if (!enrollment) {
    return next(
      new AppError(404, "Invalid certificate code or certificate not found.")
    );
  }

  res.status(200).json({
    success: true,
    data: {
      certificateCode: enrollment.certificateCode,
      studentName: enrollment.student?.name,
      courseTitle: enrollment.course?.title,
      courseSlug: enrollment.course?.slug,
      mentorName: enrollment.course?.mentor?.name,
      completedAt: enrollment.completedAt,
      enrolledAt: enrollment.enrolledAt,
    },
  });
});
