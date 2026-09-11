import express from 'express';
import { getStockMovement, getValuation, getLowStock } from '../controllers/reportController.js';
import {
  stockMovementQueryValidator,
  paginationQueryValidator,
} from '../validators/reportValidators.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stock-movement', stockMovementQueryValidator, validateRequest, getStockMovement);
router.get('/valuation', getValuation);
router.get('/low-stock', paginationQueryValidator, validateRequest, getLowStock);

export default router;
