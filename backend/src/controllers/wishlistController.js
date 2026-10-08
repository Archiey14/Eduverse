import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value));

// GET /api/wishlist -> the learner's saved (published) courses
export const getWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select("wishlist")
    .lean();

  const ids = user?.wishlist || [];

  const courses = await Course.find({ _id: { $in: ids }, status: "published" })
    .populate("mentor", "name avatarUrl")
    .populate("category", "name slug")
    .lean();

  // Keep the order the learner saved them in (most recent first)
  const order = new Map(ids.map((id, index) => [String(id), index]));
  courses.sort(
    (a, b) => (order.get(String(b._id)) ?? 0) - (order.get(String(a._id)) ?? 0)
  );

  res.status(200).json({
    success: true,
    data: courses,
    ids: courses.map((c) => String(c._id)),
  });
});

// POST /api/wishlist/:courseId
export const addToWishlist = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  if (!isObjectId(courseId)) {
    return next(new AppError(400, "Invalid course id."));
  }

  const course = await Course.findById(courseId).select("status");
  if (!course || course.status !== "published") {
    return next(new AppError(404, "Course not found."));
  }

  await User.updateOne(
    { _id: req.user._id },
    { $addToSet: { wishlist: course._id } }
  );

  res.status(200).json({
    success: true,
    message: "Course saved to your wishlist.",
  });
});

// DELETE /api/wishlist/:courseId
export const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  if (!isObjectId(courseId)) {
    return next(new AppError(400, "Invalid course id."));
  }

  await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: courseId } });

  res.status(200).json({
    success: true,
    message: "Course removed from your wishlist.",
  });
});
