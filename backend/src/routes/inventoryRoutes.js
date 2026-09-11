import express from 'express';
import { getInventory, postStockIn, postStockOut } from '../controllers/inventoryController.js';
import { stockOperationValidator } from '../validators/inventoryValidators.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Everything here requires login. Unlike warehouses, there's no
// admin-only restriction -- stock in/out is routine staff work
// (Phase 1 role definitions).
router.use(protect);

router.get('/', getInventory);
router.post('/stock-in', stockOperationValidator, validateRequest, postStockIn);
router.post('/stock-out', stockOperationValidator, validateRequest, postStockOut);

export default router;
