import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: [100, 'Product name must be at most 100 characters'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [2, 'SKU must be at least 2 characters'],
      maxlength: [30, 'SKU must be at most 30 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    // Optional: a product may not have a supplier assigned yet. One
    // supplier per product (not many-to-many) -- see Phase 1 assumptions.
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
      maxlength: [20, 'Unit must be at most 20 characters'],
    },
    // What the business pays to acquire/produce one unit.
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative'],
    },
    // What the business charges a customer for one unit.
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    // Used by the dashboard (Phase 12) to flag products running low.
    // Lives on the product because it's a per-product business setting,
    // not something that changes with every stock movement.
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, 'Low stock threshold cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description must be at most 1000 characters'],
      default: '',
    },
    // Soft-delete flag. Past stock transactions may reference this
    // product, so it's deactivated rather than removed.
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
