function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;

  if (statusCode >= 500) {
    console.error('[ErrorHandler] Error del servidor:', {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'test' ? undefined : err.stack,
      details: err.details || err.data
    });
  }

  res.status(statusCode).json({
    error: err.message || 'Error interno del servidor',
    details: err.details || err.data || null
  });
}

module.exports = errorHandler;
