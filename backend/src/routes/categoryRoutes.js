import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
} from '../controllers/categoryController.js';
import {
  categoryIdValidator,
  createCategoryValidator,
  updateCategoryValidator,
} from '../validators/categoryValidators.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Every category route requires a logged-in user; only mutating routes
// are further restricted to admins below.
router.use(protect);

router.get('/', getCategories);
router.get('/:id', categoryIdValidator, validateRequest, getCategoryById);

router.post('/', authorize('admin'), createCategoryValidator, validateRequest, createCategory);
router.put('/:id', authorize('admin'), updateCategoryValidator, validateRequest, updateCategory);
router.delete('/:id', authorize('admin'), categoryIdValidator, validateRequest, deleteCategory);
router.patch(
  '/:id/restore',
  authorize('admin'),
  categoryIdValidator,
  validateRequest,
  restoreCategory
);

export default router;
