import express from 'express';
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  restoreSupplier,
} from '../controllers/supplierController.js';
import {
  supplierIdValidator,
  createSupplierValidator,
  updateSupplierValidator,
} from '../validators/supplierValidators.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Every supplier route requires a logged-in user; only mutating routes
// are further restricted to admins below.
router.use(protect);

router.get('/', getSuppliers);
router.get('/:id', supplierIdValidator, validateRequest, getSupplierById);

router.post('/', authorize('admin'), createSupplierValidator, validateRequest, createSupplier);
router.put('/:id', authorize('admin'), updateSupplierValidator, validateRequest, updateSupplier);
router.delete('/:id', authorize('admin'), supplierIdValidator, validateRequest, deleteSupplier);
router.patch(
  '/:id/restore',
  authorize('admin'),
  supplierIdValidator,
  validateRequest,
  restoreSupplier
);

export default router;
