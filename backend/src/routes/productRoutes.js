import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
} from '../controllers/productController.js';
import {
  productIdValidator,
  createProductValidator,
  updateProductValidator,
} from '../validators/productValidators.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Every product route requires a logged-in user; only mutating routes
// are further restricted to admins below.
router.use(protect);

router.get('/', getProducts);
router.get('/:id', productIdValidator, validateRequest, getProductById);

router.post('/', authorize('admin'), createProductValidator, validateRequest, createProduct);
router.put('/:id', authorize('admin'), updateProductValidator, validateRequest, updateProduct);
router.delete('/:id', authorize('admin'), productIdValidator, validateRequest, deleteProduct);
router.patch(
  '/:id/restore',
  authorize('admin'),
  productIdValidator,
  validateRequest,
  restoreProduct
);

export default router;
