// A custom error carrying an HTTP status code (and optionally field-level
// validation errors), so controllers/services can just `throw` instead of
// manually setting res.status(...) everywhere. The central errorHandler
// middleware reads statusCode/errors off of this to build the response.
export class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;

    // Distinguishes errors we threw on purpose (bad input, not found, etc.)
    // from genuine bugs/crashes, which is useful if we ever want to log
    // only the unexpected ones differently.
    this.isOperational = true;
  }
}
