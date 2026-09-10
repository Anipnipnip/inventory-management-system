// Runs when a request doesn't match any route. Converts it into an
// error so it flows into the same errorHandler below, instead of
// letting Express send its default HTML 404 page.
export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found - ${req.originalUrl}`));
};

// Central error handler. Every thrown/passed error in the app ends up
// here, so the API always responds with the same JSON shape.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Stack traces are only useful to developers, never to a client in production.
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
