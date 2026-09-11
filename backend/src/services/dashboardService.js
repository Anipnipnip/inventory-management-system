import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import StockTransaction from '../models/StockTransaction.js';

// Midnight of the current server day. "Today" for dashboard purposes
// means "since this morning", not "the last 24 hours" -- the two read
// very differently to a business owner checking the dashboard at 5pm.
const startOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

// Everything the dashboard needs, gathered in parallel. Each figure is
// computed with the database (aggregation, countDocuments) rather than
// pulling every document into Node.js and summing it in JavaScript --
// that approach gets slower as the catalog grows, this stays fast.
export const getDashboardSummary = async () => {
  const todayStart = startOfToday();

  const [
    totalProducts,
    inventoryValueResult,
    lowStockProducts,
    stockInToday,
    stockOutToday,
    recentActivity,
  ] = await Promise.all([
    Product.countDocuments({ isActive: true }),

    // Total inventory value = sum of (quantity * costPrice) across every
    // Inventory row. $lookup joins in the product's costPrice since
    // Inventory itself only stores quantity (Phase 9 design).
    Inventory.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$quantity', '$productInfo.costPrice'] } },
        },
      },
    ]),

    // Products at or below their configured lowStockThreshold. Joins
    // Inventory -> Product so both quantity and the per-product
    // threshold are compared in a single pipeline.
    Inventory.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      { $match: { 'productInfo.isActive': true } },
      { $match: { $expr: { $lte: ['$quantity', '$productInfo.lowStockThreshold'] } } },
      {
        $project: {
          product: '$productInfo._id',
          name: '$productInfo.name',
          sku: '$productInfo.sku',
          quantity: '$quantity',
          lowStockThreshold: '$productInfo.lowStockThreshold',
        },
      },
      { $sort: { quantity: 1 } },
      { $limit: 20 },
    ]),

    StockTransaction.aggregate([
      { $match: { type: 'in', createdAt: { $gte: todayStart } } },
      { $group: { _id: null, count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
    ]),

    StockTransaction.aggregate([
      { $match: { type: 'out', createdAt: { $gte: todayStart } } },
      { $group: { _id: null, count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
    ]),

    StockTransaction.find()
      .populate('product', 'name sku')
      .populate('warehouse', 'name')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  return {
    totalProducts,
    totalInventoryValue: inventoryValueResult[0]?.totalValue || 0,
    lowStockProducts,
    lowStockCount: lowStockProducts.length,
    stockInToday: stockInToday[0] || { count: 0, totalQuantity: 0 },
    stockOutToday: stockOutToday[0] || { count: 0, totalQuantity: 0 },
    recentActivity,
  };
};
