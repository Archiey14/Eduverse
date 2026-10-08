import { Discussion } from "../models/Discussion.js";
import { Course } from "../models/Course.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDiscussions = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { lessonId } = req.query;

  const filter = { course: courseId, parent: null };
  if (lessonId) filter.lesson = lessonId;

  const threads = await Discussion.find(filter)
    .populate("user", "name avatarUrl")
    .sort({ createdAt: -1 })
    .lean();

  const threadIds = threads.map((t) => t._id);
  const replies = await Discussion.find({ parent: { $in: threadIds } })
    .populate("user", "name avatarUrl")
    .sort({ createdAt: 1 })
    .lean();

  const repliesByThread = replies.reduce((acc, reply) => {
    if (!acc[reply.parent]) acc[reply.parent] = [];
    acc[reply.parent].push(reply);
    return acc;
  }, {});

  const data = threads.map((thread) => ({
    ...thread,
    replies: repliesByThread[thread._id] || [],
  }));

  res.status(200).json({ success: true, data });
});

export const createDiscussion = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const { lessonId, content } = req.body;

  if (!content) return next(new AppError(400, "Content is required"));

  const course = await Course.findById(courseId);
  if (!course) return next(new AppError(404, "Course not found"));

  const isInstructor = String(course.mentor) === String(req.user._id);

  const discussion = await Discussion.create({
    course: courseId,
    lesson: lessonId || null,
    user: req.user._id,
    content,
    isInstructorResponse: isInstructor,
  });

  await discussion.populate("user", "name avatarUrl");

  res.status(201).json({ success: true, data: { ...discussion.toObject(), replies: [] } });
});

export const createReply = asyncHandler(async (req, res, next) => {
  const { discussionId } = req.params;
  const { content } = req.body;

  if (!content) return next(new AppError(400, "Content is required"));

  const parent = await Discussion.findById(discussionId).populate("course");
  if (!parent) return next(new AppError(404, "Discussion not found"));

  const isInstructor = String(parent.course.mentor) === String(req.user._id);

  const reply = await Discussion.create({
    course: parent.course._id,
    lesson: parent.lesson,
    user: req.user._id,
    parent: discussionId,
    content,
    isInstructorResponse: isInstructor,
  });

  await reply.populate("user", "name avatarUrl");

  res.status(201).json({ success: true, data: reply });
});
