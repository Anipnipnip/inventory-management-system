import { AppError } from '../utils/AppError.js';

// Runs when a request doesn't match any route. Converts it into an
// error so it flows into the same errorHandler below, instead of
// letting Express send its default HTML 404 page.
export const notFound = (req, res, next) => {
  next(new AppError(`Route not found - ${req.originalUrl}`, 404));
};

// Translates known error types (Mongoose, JWT) into an AppError with the
// right HTTP status, so the rest of the app can just throw a plain Error
// and still get a sensible response. Anything not recognized here falls
// through as a generic 500.
const normalizeError = (err) => {
  if (err instanceof AppError) return err;

  // Mongoose schema validation failed (required field missing, minlength, etc.)
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return new AppError('Validation failed', 400, errors);
  }

  // Duplicate key on a unique index (e.g. email already registered).
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return new AppError(`${field} '${err.keyValue[field]}' is already in use`, 409);
  }

  // Malformed MongoDB ObjectId (e.g. GET /api/products/not-a-valid-id).
  if (err.name === 'CastError') {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // Invalid or tampered JWT, and expired JWT.
  if (err.name === 'JsonWebTokenError') {
    return new AppError('Invalid token, please log in again', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return new AppError('Session expired, please log in again', 401);
  }

  return new AppError(err.message || 'Internal Server Error', 500);
};

// Central error handler. Every thrown/passed error in the app ends up
// here (including from async route handlers, which Express 5 forwards
// automatically), so the API always responds with the same JSON shape.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const normalized = normalizeError(err);

  // Unexpected (non-operational) errors are still worth seeing in the
  // server logs even though the client only gets a generic message.
  if (!err.isOperational) {
    console.error(err);
  }

  res.status(normalized.statusCode).json({
    success: false,
    message: normalized.message,
    ...(normalized.errors && { errors: normalized.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
