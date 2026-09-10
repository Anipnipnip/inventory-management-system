import Supplier from '../models/Supplier.js';
import { AppError } from '../utils/AppError.js';
import { escapeRegex } from '../utils/escapeRegex.js';

// GET /api/suppliers
export const getSuppliers = async (req, res) => {
  const showInactive = req.user.role === 'admin' && req.query.includeInactive === 'true';
  const filter = showInactive ? {} : { isActive: true };

  const suppliers = await Supplier.find(filter).sort({ name: 1 });

  res.status(200).json({
    success: true,
    message: 'Suppliers retrieved',
    data: { suppliers },
  });
};

// GET /api/suppliers/:id
export const getSupplierById = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    throw new AppError('Supplier not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Supplier retrieved',
    data: { supplier },
  });
};

// POST /api/suppliers
export const createSupplier = async (req, res) => {
  const { name, contactPerson, phone, email, address } = req.body;

  // Case-insensitive duplicate check, same reasoning as Category/Product.
  const existing = await Supplier.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') });
  if (existing) {
    throw new AppError(`Supplier '${name}' already exists`, 409);
  }

  const supplier = await Supplier.create({ name, contactPerson, phone, email, address });

  res.status(201).json({
    success: true,
    message: 'Supplier created',
    data: { supplier },
  });
};

// PUT /api/suppliers/:id
export const updateSupplier = async (req, res) => {
  const { name } = req.body;

  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    throw new AppError('Supplier not found', 404);
  }

  if (name && name.toLowerCase() !== supplier.name.toLowerCase()) {
    const existing = await Supplier.findOne({
      _id: { $ne: supplier._id },
      name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
    });
    if (existing) {
      throw new AppError(`Supplier '${name}' already exists`, 409);
    }
  }

  const updatableFields = ['name', 'contactPerson', 'phone', 'email', 'address'];
  for (const field of updatableFields) {
    if (req.body[field] !== undefined) {
      supplier[field] = req.body[field];
    }
  }

  await supplier.save();

  res.status(200).json({
    success: true,
    message: 'Supplier updated',
    data: { supplier },
  });
};

// DELETE /api/suppliers/:id
export const deleteSupplier = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    throw new AppError('Supplier not found', 404);
  }

  supplier.isActive = false;
  await supplier.save();

  res.status(200).json({
    success: true,
    message: 'Supplier deleted',
    data: { supplier },
  });
};

// PATCH /api/suppliers/:id/restore
export const restoreSupplier = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    throw new AppError('Supplier not found', 404);
  }

  supplier.isActive = true;
  await supplier.save();

  res.status(200).json({
    success: true,
    message: 'Supplier restored',
    data: { supplier },
  });
};
