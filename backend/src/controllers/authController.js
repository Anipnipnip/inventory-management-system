import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { AppError } from '../utils/AppError.js';

// POST /api/auth/register
// Public registration always creates a "staff" account. Admin accounts
// are created via the seed script or by an existing admin through the
// user management endpoints (Phase 5) -- never by whatever the client
// sends in the request body, otherwise anyone could self-promote.
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  const user = await User.create({ name, email, password, role: 'staff' });
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user, token },
  });
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Password is select:false on the schema, so it must be explicitly
  // requested here -- comparePassword() below needs the actual hash.
  const user = await User.findOne({ email }).select('+password');

  // Same generic message whether the email doesn't exist or the password
  // is wrong, so a caller can't use this endpoint to find out which
  // emails are registered.
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('This account has been deactivated', 401);
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user, token },
  });
};

// GET /api/auth/me
// req.user is attached by the `protect` middleware, which already loaded
// it from the database, so this just returns what's already there.
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Current user retrieved',
    data: { user: req.user },
  });
};
