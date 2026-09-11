import Inventory from '../models/Inventory.js';
import StockTransaction from '../models/StockTransaction.js';
import Warehouse from '../models/Warehouse.js';
import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';

// Shared by stock-in/out (and, in Phase 10, transfer): confirms the
// product exists+active, and resolves which warehouse to use --
// defaulting to the one warehouse marked isDefault when the caller
// doesn't specify one, so single-location businesses never have to
// think about warehouses (Phase 1, assumption A1).
const resolveProductAndWarehouse = async (productId, warehouseId) => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new AppError('Product not found or inactive', 400);
  }

  let warehouse;
  if (warehouseId) {
    warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse || !warehouse.isActive) {
      throw new AppError('Warehouse not found or inactive', 400);
    }
  } else {
    warehouse = await Warehouse.findOne({ isDefault: true, isActive: true });
    if (!warehouse) {
      throw new AppError('No default warehouse configured', 500);
    }
  }

  return { product, warehouse };
};

// Stock In: increases quantity. Always succeeds for a valid
// product/warehouse -- there's no upper bound to enforce.
export const stockIn = async ({ productId, warehouseId, quantity, userId, note }) => {
  const { product, warehouse } = await resolveProductAndWarehouse(productId, warehouseId);

  // upsert: true creates the Inventory row (starting from quantity 0)
  // the first time this product/warehouse combination receives stock,
  // so callers never need a separate "initialize inventory" step.
  const inventory = await Inventory.findOneAndUpdate(
    { product: product._id, warehouse: warehouse._id },
    { $inc: { quantity } },
    { new: true, upsert: true }
  );

  const previousStock = inventory.quantity - quantity;

  const transaction = await StockTransaction.create({
    product: product._id,
    warehouse: warehouse._id,
    type: 'in',
    quantity,
    previousStock,
    newStock: inventory.quantity,
    performedBy: userId,
    note,
  });

  return { inventory, transaction };
};

// Stock Out: decreases quantity, but only if enough is available. The
// filter's `quantity: { $gte: quantity }` and the `$inc` that lowers it
// happen as a single atomic operation in MongoDB -- so two concurrent
// stock-out requests can never both succeed past the point where stock
// would go negative (Phase 1 business rule #1). No transaction/session
// needed for this guarantee; see Phase 9 design notes.
export const stockOut = async ({ productId, warehouseId, quantity, userId, note }) => {
  const { product, warehouse } = await resolveProductAndWarehouse(productId, warehouseId);

  const inventory = await Inventory.findOneAndUpdate(
    { product: product._id, warehouse: warehouse._id, quantity: { $gte: quantity } },
    { $inc: { quantity: -quantity } },
    { new: true }
  );

  if (!inventory) {
    // Either there's no inventory row yet (never stocked) or there's
    // not enough on hand -- both are "insufficient stock" from the
    // caller's point of view.
    throw new AppError('Insufficient stock for this operation', 400);
  }

  const previousStock = inventory.quantity + quantity;

  const transaction = await StockTransaction.create({
    product: product._id,
    warehouse: warehouse._id,
    type: 'out',
    quantity,
    previousStock,
    newStock: inventory.quantity,
    performedBy: userId,
    note,
  });

  return { inventory, transaction };
};
