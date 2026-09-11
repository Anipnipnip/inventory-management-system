import Warehouse from '../models/Warehouse.js';
import { AppError } from '../utils/AppError.js';
import { escapeRegex } from '../utils/escapeRegex.js';

// GET /api/warehouses
export const getWarehouses = async (req, res) => {
  const showInactive = req.query.includeInactive === 'true';
  const filter = showInactive ? {} : { isActive: true };

  const warehouses = await Warehouse.find(filter).sort({ name: 1 });

  res.status(200).json({
    success: true,
    message: 'Warehouses retrieved',
    data: { warehouses },
  });
};

// GET /api/warehouses/:id
export const getWarehouseById = async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id);

  if (!warehouse) {
    throw new AppError('Warehouse not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Warehouse retrieved',
    data: { warehouse },
  });
};

// POST /api/warehouses
export const createWarehouse = async (req, res) => {
  const { name, location } = req.body;

  const existing = await Warehouse.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') });
  if (existing) {
    throw new AppError(`Warehouse '${name}' already exists`, 409);
  }

  const warehouse = await Warehouse.create({ name, location });

  res.status(201).json({
    success: true,
    message: 'Warehouse created',
    data: { warehouse },
  });
};

// PUT /api/warehouses/:id
export const updateWarehouse = async (req, res) => {
  const { name, location } = req.body;

  const warehouse = await Warehouse.findById(req.params.id);
  if (!warehouse) {
    throw new AppError('Warehouse not found', 404);
  }

  if (name && name.toLowerCase() !== warehouse.name.toLowerCase()) {
    const existing = await Warehouse.findOne({
      _id: { $ne: warehouse._id },
      name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
    });
    if (existing) {
      throw new AppError(`Warehouse '${name}' already exists`, 409);
    }
    warehouse.name = name;
  }

  if (location !== undefined) {
    warehouse.location = location;
  }

  await warehouse.save();

  res.status(200).json({
    success: true,
    message: 'Warehouse updated',
    data: { warehouse },
  });
};

// DELETE /api/warehouses/:id
export const deleteWarehouse = async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id);
  if (!warehouse) {
    throw new AppError('Warehouse not found', 404);
  }

  // The default warehouse is where stock in/out lands when no warehouse
  // is specified -- removing it would silently break those operations.
  if (warehouse.isDefault) {
    throw new AppError(
      'Cannot deactivate the default warehouse. Set another warehouse as default first.',
      400
    );
  }

  warehouse.isActive = false;
  await warehouse.save();

  res.status(200).json({
    success: true,
    message: 'Warehouse deleted',
    data: { warehouse },
  });
};

// PATCH /api/warehouses/:id/restore
export const restoreWarehouse = async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id);
  if (!warehouse) {
    throw new AppError('Warehouse not found', 404);
  }

  warehouse.isActive = true;
  await warehouse.save();

  res.status(200).json({
    success: true,
    message: 'Warehouse restored',
    data: { warehouse },
  });
};

// PATCH /api/warehouses/:id/set-default
// A dedicated endpoint rather than allowing isDefault through the
// generic update -- switching the default warehouse is a meaningful
// action worth its own audit-friendly route, and it must unset the
// previous default atomically.
export const setDefaultWarehouse = async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id);
  if (!warehouse) {
    throw new AppError('Warehouse not found', 404);
  }
  if (!warehouse.isActive) {
    throw new AppError('Cannot set an inactive warehouse as default', 400);
  }

  await Warehouse.updateMany({ isDefault: true }, { isDefault: false });
  warehouse.isDefault = true;
  await warehouse.save();

  res.status(200).json({
    success: true,
    message: `'${warehouse.name}' is now the default warehouse`,
    data: { warehouse },
  });
};
