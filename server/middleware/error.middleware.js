/**
 * Centralized error-handling middleware.
 */

function errorHandler(err, req, res, next) {
  // Safe logging
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  // Duplicate key (e.g. unique constraint on university_id or junction tables)
  if (err.code === 'ER_DUP_ENTRY' || err.message?.includes('Duplicate entry')) {
    return res.status(409).json({
      success: false,
      error: 'A record with this identifier already exists in the system.'
    });
  }

  // JSON parsing error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Malformed JSON payload.'
    });
  }

  // Unauthorized JWT error
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token.'
    });
  }

  // Generic 500 error: Do not leak stack traces in non-development environments
  const isDev = process.env.NODE_ENV === 'development';
  res.status(err.status || 500).json({
    success: false,
    error: isDev ? err.message : 'An unexpected server error occurred. Please try again later.',
    ...(isDev && { details: err.stack })
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
