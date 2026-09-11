import Inventory from '../models/Inventory.js';
import StockTransaction from '../models/StockTransaction.js';
import Warehouse from '../models/Warehouse.js';
import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

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

// Stock Transfer: moves quantity from one warehouse to another for the
// same product. Two Inventory documents are involved, and this
// environment's MongoDB runs as a standalone server (no replica set),
// so a multi-document transaction isn't available -- see Phase 9/10
// design notes. Instead, the steps are deliberately ordered:
//   1. Deduct from source atomically, with the same $gte guard as
//      stockOut, so this can never push the source negative.
//   2. Add to destination.
//   3. If step 2 somehow fails, compensate by adding the quantity back
//      to the source -- so a failure never silently loses stock.
export const transferStock = async ({
  productId,
  fromWarehouseId,
  toWarehouseId,
  quantity,
  userId,
  note,
}) => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new AppError('Product not found or inactive', 400);
  }

  const [fromWarehouse, toWarehouse] = await Promise.all([
    Warehouse.findById(fromWarehouseId),
    Warehouse.findById(toWarehouseId),
  ]);
  if (!fromWarehouse || !fromWarehouse.isActive) {
    throw new AppError('Source warehouse not found or inactive', 400);
  }
  if (!toWarehouse || !toWarehouse.isActive) {
    throw new AppError('Destination warehouse not found or inactive', 400);
  }

  const sourceInventory = await Inventory.findOneAndUpdate(
    { product: product._id, warehouse: fromWarehouse._id, quantity: { $gte: quantity } },
    { $inc: { quantity: -quantity } },
    { new: true }
  );
  if (!sourceInventory) {
    throw new AppError('Insufficient stock at the source warehouse for this transfer', 400);
  }

  let destinationInventory;
  try {
    destinationInventory = await Inventory.findOneAndUpdate(
      { product: product._id, warehouse: toWarehouse._id },
      { $inc: { quantity } },
      { new: true, upsert: true }
    );
  } catch (err) {
    // Compensate: put the quantity back at the source so it isn't lost.
    await Inventory.updateOne(
      { product: product._id, warehouse: fromWarehouse._id },
      { $inc: { quantity } }
    );
    throw err;
  }

  const [transferOut, transferIn] = await Promise.all([
    StockTransaction.create({
      product: product._id,
      warehouse: fromWarehouse._id,
      type: 'transfer-out',
      quantity,
      previousStock: sourceInventory.quantity + quantity,
      newStock: sourceInventory.quantity,
      performedBy: userId,
      note,
    }),
    StockTransaction.create({
      product: product._id,
      warehouse: toWarehouse._id,
      type: 'transfer-in',
      quantity,
      previousStock: destinationInventory.quantity - quantity,
      newStock: destinationInventory.quantity,
      performedBy: userId,
      note,
    }),
  ]);

  return { sourceInventory, destinationInventory, transferOut, transferIn };
};

// Filtered, paginated read of the StockTransaction log. Uses the same
// server-side pagination helper as the product list (Phase 11) -- large
// history logs get the same "fetch only this page" treatment instead of
// loading the entire log to show 20 rows.
export const getStockHistory = async (filters) => {
  const { product, warehouse, type, startDate, endDate } = filters;

  const query = {};
  if (product) query.product = product;
  if (warehouse) query.warehouse = warehouse;
  if (type) query.type = type;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const { page, limit, skip } = parsePagination(filters);

  const [transactions, total] = await Promise.all([
    StockTransaction.find(query)
      .populate('product', 'name sku')
      .populate('warehouse', 'name')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    StockTransaction.countDocuments(query),
  ]);

  return { transactions, pagination: buildPaginationMeta(total, page, limit) };
};
