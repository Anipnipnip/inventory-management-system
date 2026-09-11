import Inventory from '../models/Inventory.js';
import StockTransaction from '../models/StockTransaction.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

// GET /api/reports/stock-movement
// A filtered, chronological list of stock movements -- essentially the
// same data as inventory history (Phase 10), but framed as a report:
// grouped totals per movement type are included alongside the raw list
// so an admin doesn't have to tally the rows themselves.
export const getStockMovementReport = async ({ product, warehouse, startDate, endDate, page, limit }) => {
  const match = {};
  if (product) match.product = product;
  if (warehouse) match.warehouse = warehouse;
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const { page: p, limit: l, skip } = parsePagination({ page, limit });

  const [transactions, total, totalsByType] = await Promise.all([
    StockTransaction.find(match)
      .populate('product', 'name sku')
      .populate('warehouse', 'name')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l),
    StockTransaction.countDocuments(match),
    StockTransaction.aggregate([
      { $match: match },
      { $group: { _id: '$type', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
    ]),
  ]);

  return {
    transactions,
    totalsByType,
    pagination: buildPaginationMeta(total, p, l),
  };
};

// GET /api/reports/valuation
// Per-product inventory value (quantity * costPrice), plus a grand
// total -- answers "how much money is tied up in stock, and where".
export const getValuationReport = async () => {
  const rows = await Inventory.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    { $unwind: '$productInfo' },
    { $match: { 'productInfo.isActive': true, quantity: { $gt: 0 } } },
    {
      $lookup: {
        from: 'warehouses',
        localField: 'warehouse',
        foreignField: '_id',
        as: 'warehouseInfo',
      },
    },
    { $unwind: '$warehouseInfo' },
    {
      $project: {
        product: '$productInfo._id',
        name: '$productInfo.name',
        sku: '$productInfo.sku',
        warehouse: '$warehouseInfo.name',
        quantity: '$quantity',
        costPrice: '$productInfo.costPrice',
        totalValue: { $multiply: ['$quantity', '$productInfo.costPrice'] },
      },
    },
    { $sort: { totalValue: -1 } },
  ]);

  const grandTotal = rows.reduce((sum, row) => sum + row.totalValue, 0);

  return { rows, grandTotal };
};

// GET /api/reports/low-stock
// The full, paginated version of the dashboard's low-stock preview
// (Phase 12) -- same underlying condition (quantity <= threshold), but
// without the dashboard's fixed cap of 20.
export const getLowStockReport = async ({ page, limit }) => {
  const { page: p, limit: l, skip } = parsePagination({ page, limit });

  const basePipeline = [
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
  ];

  const [rows, totalResult] = await Promise.all([
    Inventory.aggregate([
      ...basePipeline,
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
      { $skip: skip },
      { $limit: l },
    ]),
    Inventory.aggregate([...basePipeline, { $count: 'total' }]),
  ]);

  const total = totalResult[0]?.total || 0;

  return { rows, pagination: buildPaginationMeta(total, p, l) };
};
