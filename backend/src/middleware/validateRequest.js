import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

// Runs after a route's express-validator chains (e.g. body('email').isEmail()).
// Collects any failures into the same { success, message, errors } shape
// used everywhere else, instead of each route handling validation output
// itself.
export const validateRequest = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return next(new AppError('Validation failed', 400, errors));
  }

  next();
};
