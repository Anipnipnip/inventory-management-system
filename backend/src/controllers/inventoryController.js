import Inventory from '../models/Inventory.js';
import { stockIn, stockOut } from '../services/inventoryService.js';

// GET /api/inventory
// Current stock levels, optionally narrowed to one product and/or
// warehouse. This is a read of the Inventory snapshot -- for the
// movement history behind these numbers, see /api/inventory/history
// (Phase 10).
export const getInventory = async (req, res) => {
  const filter = {};
  if (req.query.product) filter.product = req.query.product;
  if (req.query.warehouse) filter.warehouse = req.query.warehouse;

  const inventory = await Inventory.find(filter)
    .populate('product', 'name sku unit')
    .populate('warehouse', 'name')
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Inventory retrieved',
    data: { inventory },
  });
};

// POST /api/inventory/stock-in
// Open to both admin and staff -- receiving stock from a supplier is a
// day-to-day staff task (Phase 1 role definitions).
export const postStockIn = async (req, res) => {
  const { productId, warehouseId, quantity, note } = req.body;

  const { inventory, transaction } = await stockIn({
    productId,
    warehouseId,
    quantity,
    userId: req.user._id,
    note,
  });

  res.status(201).json({
    success: true,
    message: 'Stock in recorded',
    data: { inventory, transaction },
  });
};

// POST /api/inventory/stock-out
// Also open to staff -- selling/using stock is routine, not an admin
// action. The service throws if there isn't enough stock available.
export const postStockOut = async (req, res) => {
  const { productId, warehouseId, quantity, note } = req.body;

  const { inventory, transaction } = await stockOut({
    productId,
    warehouseId,
    quantity,
    userId: req.user._id,
    note,
  });

  res.status(201).json({
    success: true,
    message: 'Stock out recorded',
    data: { inventory, transaction },
  });
};
