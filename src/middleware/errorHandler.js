/**
 * Middleware centralizado para manejo de errores
 */

class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  // Si el error ya tiene statusCode, usarlo
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  // Log del error en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body
    });
  }

  // Errores de base de datos
  if (err.code === '23505') { // Violación de unique constraint
    return res.status(400).json({
      success: false,
      message: 'El registro ya existe',
      error: 'DUPLICATE_ENTRY'
    });
  }

  if (err.code === '23503') { // Violación de foreign key
    return res.status(400).json({
      success: false,
      message: 'Referencia inválida. El registro relacionado no existe',
      error: 'FOREIGN_KEY_VIOLATION'
    });
  }

  if (err.code === '23502') { // Violación de NOT NULL
    return res.status(400).json({
      success: false,
      message: 'Campo requerido faltante',
      error: 'NOT_NULL_VIOLATION'
    });
  }

  // Errores de validación de PostgreSQL
  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación en la base de datos',
      error: err.code
    });
  }

  // Error operacional (creado con AppError)
  if (err.isOperational) {
    return res.status(statusCode).json({
      success: false,
      message: message,
      error: err.code || 'OPERATIONAL_ERROR',
      ...(err.details && { details: err.details })
    });
  }

  // Error desconocido
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : message,
    error: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  AppError,
  errorHandler
};

