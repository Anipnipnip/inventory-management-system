import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidators.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidator, validateRequest, register);
router.post('/login', authLimiter, loginValidator, validateRequest, login);
router.get('/me', protect, getMe);

export default router;
