import mongoose from "mongoose";
import { Lesson } from "../models/Lesson.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addSection = asyncHandler(async (req, res, next) => {
  const course = req.course;
  const { title } = req.body;

  if (!title || !title.trim()) {
    return next(new AppError(400, "Section title is required."));
  }

  const nextOrder = (course.sections?.length || 0) + 1;
  const newSection = {
    _id: new mongoose.Types.ObjectId(),
    title: title.trim(),
    order: nextOrder,
  };

  course.sections.push(newSection);
  await course.save();

  res.status(201).json({
    success: true,
    message: "Section added successfully",
    data: newSection,
    sections: course.sections,
  });
});

export const updateSection = asyncHandler(async (req, res, next) => {
  const course = req.course;
  const { sectionId } = req.params;
  const { title } = req.body;

  if (!title || !title.trim()) {
    return next(new AppError(400, "Section title cannot be empty."));
  }

  const section = course.sections.id(sectionId);
  if (!section) {
    return next(new AppError(404, "Section not found."));
  }

  section.title = title.trim();
  await course.save();

  res.status(200).json({
    success: true,
    message: "Section updated successfully",
    data: section,
    sections: course.sections,
  });
});

export const deleteSection = asyncHandler(async (req, res, next) => {
  const course = req.course;
  const { sectionId } = req.params;

  const section = course.sections.id(sectionId);
  if (!section) {
    return next(new AppError(404, "Section not found."));
  }

  // Check if lessons exist in this section
  const lessonCount = await Lesson.countDocuments({
    course: course._id,
    sectionId,
  });

  if (lessonCount > 0 && !req.query.force) {
    return next(
      new AppError(
        400,
        `Section contains ${lessonCount} lessons. Please move or delete lessons first, or specify ?force=true to delete lessons together.`
      )
    );
  }

  if (req.query.force) {
    await Lesson.deleteMany({ course: course._id, sectionId });
  }

  course.sections.pull({ _id: sectionId });

  // Re-index remaining section orders
  course.sections.forEach((sec, idx) => {
    sec.order = idx + 1;
  });

  await course.save();

  res.status(200).json({
    success: true,
    message: "Section deleted successfully",
    sections: course.sections,
  });
});

export const reorderSections = asyncHandler(async (req, res, next) => {
  const course = req.course;
  const { sectionIds } = req.body;

  if (!Array.isArray(sectionIds) || sectionIds.length === 0) {
    return next(
      new AppError(400, "Please provide an array of sectionIds in new order.")
    );
  }

  const sectionMap = new Map();
  course.sections.forEach((sec) => sectionMap.set(sec._id.toString(), sec));

  const newSections = [];
  sectionIds.forEach((id, index) => {
    const sec = sectionMap.get(id.toString());
    if (sec) {
      sec.order = index + 1;
      newSections.push(sec);
    }
  });

  // Keep any unmentioned sections at the end
  course.sections.forEach((sec) => {
    if (!sectionIds.includes(sec._id.toString())) {
      sec.order = newSections.length + 1;
      newSections.push(sec);
    }
  });

  course.sections = newSections;
  await course.save();

  res.status(200).json({
    success: true,
    message: "Sections reordered successfully",
    sections: course.sections,
  });
});
