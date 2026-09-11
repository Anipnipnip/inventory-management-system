import express from 'express';
import {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  restoreWarehouse,
  setDefaultWarehouse,
} from '../controllers/warehouseController.js';
import {
  warehouseIdValidator,
  createWarehouseValidator,
  updateWarehouseValidator,
} from '../validators/warehouseValidators.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Warehouse management is admin-only end to end -- unlike categories or
// products, staff never need to browse or manage warehouses directly,
// they just do stock in/out (which resolves a warehouse behind the scenes).
router.use(protect, authorize('admin'));

router.get('/', getWarehouses);
router.get('/:id', warehouseIdValidator, validateRequest, getWarehouseById);
router.post('/', createWarehouseValidator, validateRequest, createWarehouse);
router.put('/:id', updateWarehouseValidator, validateRequest, updateWarehouse);
router.delete('/:id', warehouseIdValidator, validateRequest, deleteWarehouse);
router.patch('/:id/restore', warehouseIdValidator, validateRequest, restoreWarehouse);
router.patch('/:id/set-default', warehouseIdValidator, validateRequest, setDefaultWarehouse);

export default router;
