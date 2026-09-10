import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

// Guards routes that require a logged-in user. Reads the JWT from the
// Authorization header, verifies its signature, loads the matching user,
// and attaches it as req.user so downstream handlers know who's calling.
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Not authorized, no token provided', 401);
  }

  const token = authHeader.split(' ')[1];

  // jwt.verify throws (JsonWebTokenError / TokenExpiredError) if the
  // token is malformed, tampered with, or expired. The central
  // errorHandler turns those into a clean 401 response.
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError('Not authorized, user no longer exists', 401);
  }

  if (!user.isActive) {
    throw new AppError('This account has been deactivated', 401);
  }

  req.user = user;
  next();
};
