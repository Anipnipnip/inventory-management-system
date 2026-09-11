import mongoose from 'mongoose';

// A snapshot of the CURRENT stock level for one product at one
// warehouse. This is intentionally the only place "how much stock is
// there right now" lives -- Product (Phase 7) never stores a quantity.
// History of how it got to this number lives in StockTransaction.
const inventorySchema = new mongoose.Schema(
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
    // Only ever changed through atomic $inc/$dec operations in
    // inventoryService.js -- never read, modified in JS, and saved back,
    // which is what would open the door to race conditions.
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
  },
  { timestamps: true }
);

// One inventory row per product+warehouse combination -- this is what
// lets findOneAndUpdate target "this product at this warehouse" as a
// single document instead of ambiguous multiple matches.
inventorySchema.index({ product: 1, warehouse: 1 }, { unique: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
