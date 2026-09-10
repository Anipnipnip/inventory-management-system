import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Supplier from '../models/Supplier.js';
import { AppError } from '../utils/AppError.js';
import { escapeRegex } from '../utils/escapeRegex.js';

// Shared across create/update: confirms the referenced category exists
// and hasn't been soft-deleted, so a product never points at a category
// that's no longer meant to be used.
const assertCategoryIsUsable = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category || !category.isActive) {
    throw new AppError('Category not found or inactive', 400);
  }
};

// Same idea as assertCategoryIsUsable, but for the optional supplier
// reference. Only called when a supplier id is actually provided.
const assertSupplierIsUsable = async (supplierId) => {
  const supplier = await Supplier.findById(supplierId);
  if (!supplier || !supplier.isActive) {
    throw new AppError('Supplier not found or inactive', 400);
  }
};

// GET /api/products
export const getProducts = async (req, res) => {
  const showInactive = req.user.role === 'admin' && req.query.includeInactive === 'true';
  const filter = showInactive ? {} : { isActive: true };

  const products = await Product.find(filter)
    .populate('category', 'name')
    .populate('supplier', 'name')
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    message: 'Products retrieved',
    data: { products },
  });
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name')
    .populate('supplier', 'name');

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Product retrieved',
    data: { product },
  });
};

// POST /api/products
export const createProduct = async (req, res) => {
  const {
    name,
    sku,
    category,
    supplier,
    unit,
    costPrice,
    sellingPrice,
    lowStockThreshold,
    description,
  } = req.body;

  await assertCategoryIsUsable(category);
  if (supplier) {
    await assertSupplierIsUsable(supplier);
  }

  // Case-insensitive duplicate check, same reasoning as Category (Phase 6):
  // the unique index alone would let "KB-001" and "kb-001" both exist.
  const existing = await Product.findOne({ sku: new RegExp(`^${escapeRegex(sku)}$`, 'i') });
  if (existing) {
    throw new AppError(`SKU '${sku}' is already in use`, 409);
  }

  const product = await Product.create({
    name,
    sku,
    category,
    supplier: supplier || null,
    unit,
    costPrice,
    sellingPrice,
    lowStockThreshold,
    description,
  });

  await product.populate('category', 'name');
  await product.populate('supplier', 'name');

  res.status(201).json({
    success: true,
    message: 'Product created',
    // Selling below cost isn't invalid (clearance sales happen), but it's
    // worth flagging so the admin can confirm it was intentional.
    ...(sellingPrice < costPrice && {
      warning: 'Selling price is lower than cost price',
    }),
    data: { product },
  });
};

// PUT /api/products/:id
export const updateProduct = async (req, res) => {
  const { sku, category, supplier } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (category) {
    await assertCategoryIsUsable(category);
  }
  if (supplier) {
    await assertSupplierIsUsable(supplier);
  }

  if (sku && sku.toLowerCase() !== product.sku.toLowerCase()) {
    const existing = await Product.findOne({
      _id: { $ne: product._id },
      sku: new RegExp(`^${escapeRegex(sku)}$`, 'i'),
    });
    if (existing) {
      throw new AppError(`SKU '${sku}' is already in use`, 409);
    }
  }

  const updatableFields = [
    'name',
    'sku',
    'category',
    'supplier',
    'unit',
    'costPrice',
    'sellingPrice',
    'lowStockThreshold',
    'description',
  ];
  for (const field of updatableFields) {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  }

  await product.save();
  await product.populate('category', 'name');
  await product.populate('supplier', 'name');

  res.status(200).json({
    success: true,
    message: 'Product updated',
    ...(product.sellingPrice < product.costPrice && {
      warning: 'Selling price is lower than cost price',
    }),
    data: { product },
  });
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  product.isActive = false;
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product deleted',
    data: { product },
  });
};

// PATCH /api/products/:id/restore
export const restoreProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  product.isActive = true;
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product restored',
    data: { product },
  });
};
