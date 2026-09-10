import express from 'express';
import {
  getUsers,
  getUserById,
  changeUserRole,
  deactivateUser,
  activateUser,
} from '../controllers/userController.js';
import { userIdValidator, changeRoleValidator } from '../validators/userValidators.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Every user-management route requires a logged-in admin. Applying
// protect + authorize here once instead of per-route keeps that
// guarantee visible in a single place.
router.use(protect, authorize('admin'));

router.get('/', getUsers);
router.get('/:id', userIdValidator, validateRequest, getUserById);
router.patch('/:id/role', changeRoleValidator, validateRequest, changeUserRole);
router.patch('/:id/deactivate', userIdValidator, validateRequest, deactivateUser);
router.patch('/:id/activate', userIdValidator, validateRequest, activateUser);

export default router;
