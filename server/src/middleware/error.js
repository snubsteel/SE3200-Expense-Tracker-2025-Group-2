// Centralized error handler keeps responses consistent and avoids leaking
// implementation details to clients. Stack traces stay server-side in prod.
export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const code = err.code || 'internal_error';
  const message = err.message || 'Unexpected error occurred.';

  if (process.env.NODE_ENV !== 'production') {
    // During development, log the full error to help with debugging.
    console.error(err);
  }

  res.status(status).json({
    error: {
      code,
      message,
    },
  });
}
