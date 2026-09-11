import mongoose from 'mongoose';

// An immutable log entry for every stock movement. Nothing in this app
// ever updates or deletes a StockTransaction once created -- it's the
// audit trail that answers "what happened to this product's stock, and
// who did it" (Phase 1 business rule #2).
const stockTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    type: {
      type: String,
      enum: ['in', 'out', 'transfer-in', 'transfer-out'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    // Captured from the atomic update's result, not read separately --
    // so these stay accurate even under concurrent requests.
    previousStock: {
      type: Number,
      required: true,
      min: 0,
    },
    newStock: {
      type: Number,
      required: true,
      min: 0,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note must be at most 500 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// Listing/filtering history (Phase 10) is almost always scoped to a
// product and sorted by recency -- this index serves that directly.
stockTransactionSchema.index({ product: 1, createdAt: -1 });

const StockTransaction = mongoose.model('StockTransaction', stockTransactionSchema);

export default StockTransaction;
