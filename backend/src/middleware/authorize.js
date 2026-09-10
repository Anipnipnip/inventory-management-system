import { AppError } from '../utils/AppError.js';

// Restricts a route to specific roles, e.g. authorize('admin').
// Must run after `protect`, since it relies on req.user being set.
//
// Kept separate from `protect`: protect answers "are you logged in?",
// this answers "are you allowed to do *this*?" -- two different
// questions, so a route can require login without requiring a
// specific role (e.g. stock in/out is open to both admin and staff).
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }
    next();
  };
};
