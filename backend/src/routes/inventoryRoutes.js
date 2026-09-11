import express from 'express';
import {
  getInventory,
  postStockIn,
  postStockOut,
  postTransfer,
  getHistory,
} from '../controllers/inventoryController.js';
import {
  stockOperationValidator,
  transferValidator,
  historyQueryValidator,
} from '../validators/inventoryValidators.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Everything here requires login. Unlike warehouses, there's no
// blanket admin-only restriction -- stock in/out is routine staff work
// (Phase 1 role definitions). Transfer is restricted per-route below.
router.use(protect);

router.get('/', getInventory);
router.get('/history', historyQueryValidator, validateRequest, getHistory);
router.post('/stock-in', stockOperationValidator, validateRequest, postStockIn);
router.post('/stock-out', stockOperationValidator, validateRequest, postStockOut);
router.post('/transfer', authorize('admin'), transferValidator, validateRequest, postTransfer);

export default router;
