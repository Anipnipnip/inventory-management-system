import Category from '../models/Category.js';
import { AppError } from '../utils/AppError.js';
import { escapeRegex } from '../utils/escapeRegex.js';

// GET /api/categories
// Staff only need active categories (they use this list to filter
// products). Admins can pass ?includeInactive=true to see everything,
// e.g. to find something to restore.
export const getCategories = async (req, res) => {
  const showInactive = req.user.role === 'admin' && req.query.includeInactive === 'true';
  const filter = showInactive ? {} : { isActive: true };

  const categories = await Category.find(filter).sort({ name: 1 });

  res.status(200).json({
    success: true,
    message: 'Categories retrieved',
    data: { categories },
  });
};

// GET /api/categories/:id
export const getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Category retrieved',
    data: { category },
  });
};

// POST /api/categories
export const createCategory = async (req, res) => {
  const { name, description } = req.body;

  // Case-insensitive duplicate check -- MongoDB's unique index alone
  // would treat "Snacks" and "snacks" as different categories.
  const existing = await Category.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') });
  if (existing) {
    throw new AppError(`Category '${name}' already exists`, 409);
  }

  const category = await Category.create({ name, description });

  res.status(201).json({
    success: true,
    message: 'Category created',
    data: { category },
  });
};

// PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  const { name, description } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  if (name && name.toLowerCase() !== category.name.toLowerCase()) {
    const existing = await Category.findOne({
      _id: { $ne: category._id },
      name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
    });
    if (existing) {
      throw new AppError(`Category '${name}' already exists`, 409);
    }
    category.name = name;
  }

  if (description !== undefined) {
    category.description = description;
  }

  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category updated',
    data: { category },
  });
};

// DELETE /api/categories/:id
// Soft delete -- Products (Phase 7) may still reference this category,
// so the document is kept and just marked inactive.
export const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  category.isActive = false;
  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category deleted',
    data: { category },
  });
};

// PATCH /api/categories/:id/restore
export const restoreCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  category.isActive = true;
  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category restored',
    data: { category },
  });
};
