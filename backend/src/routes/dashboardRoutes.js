import express from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Admin-only, per Phase 1 role definitions -- staff don't have a
// dashboard/reports view in this system.
router.use(protect, authorize('admin'));

router.get('/', getDashboard);

export default router;
