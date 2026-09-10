import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

// GET /api/users
// Full pagination/search/filter lands in Phase 11 -- for now this just
// returns every user, which is fine at small scale.
export const getUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Users retrieved',
    data: { users },
  });
};

// GET /api/users/:id
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'User retrieved',
    data: { user },
  });
};

// PATCH /api/users/:id/role
// A dedicated endpoint (rather than a generic "update user") because
// changing someone's role is a sensitive action worth keeping explicit
// and easy to audit.
export const changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Prevents the last admin from demoting themselves and losing access
  // to admin-only features with no one able to undo it.
  if (id === req.user._id.toString()) {
    throw new AppError('You cannot change your own role', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User role updated to ${role}`,
    data: { user },
  });
};

// PATCH /api/users/:id/deactivate
// Soft delete: the account is blocked from logging in, but the document
// (and its history as the "performedBy" user on past stock transactions)
// stays intact.
export const deactivateUser = async (req, res) => {
  const { id } = req.params;

  if (id === req.user._id.toString()) {
    throw new AppError('You cannot deactivate your own account', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.isActive = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User deactivated',
    data: { user },
  });
};

// PATCH /api/users/:id/activate
export const activateUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.isActive = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User activated',
    data: { user },
  });
};
