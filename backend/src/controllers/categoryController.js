import { Category } from "../models/Category.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { slugify } from "../utils/slugify.js";

export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().sort({ name: 1 }).lean();

  res.status(200).json({
    success: true,
    data: categories,
  });
});

export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  if (!name) {
    return next(new AppError(400, "Category name is required."));
  }

  const slug = slugify(name);
  const existing = await Category.findOne({
    $or: [{ name: name.trim() }, { slug }],
  });

  if (existing) {
    return next(new AppError(409, "Category already exists."));
  }

  const category = await Category.create({
    name: name.trim(),
    slug,
    description: description || "",
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    return next(new AppError(404, "Category not found."));
  }

  if (name) {
    category.name = name.trim();
    category.slug = slugify(name);
  }
  if (description !== undefined) {
    category.description = description.trim();
  }

  await category.save();

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    return next(new AppError(404, "Category not found."));
  }

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});
