// middleware/errorHandler.js
import createError from 'http-errors'
import logger from '../logger.js'

// catch-all 404 → JSON
export function notFoundHandler(req, res, next) {
  next(new createError.NotFound(`Route ${req.originalUrl} not found`))
}

export function errorHandler(err, req, res, next) {
  // Determine HTTP status
  let status = err.status || err.statusCode || 500

  // Base payload
  const payload = {
    message: err.message || 'Internal Server Error',
  }

  // 1) Mongoose validation → 400 + per-field array
  if (err.name === 'ValidationError') {
    status = 400
    payload.message = 'Validation failed'
    payload.errors = Object.values(err.errors).map(e => e.message)
  }
  // 2) Mongo duplicate key → 409
  else if (err.code === 11000) {
    status = 409
    const fields = Object.keys(err.keyValue).join(', ')
    payload.message = `Duplicate field value: ${fields}`
  }
  // 3) CORS block → 403
  else if (/Not allowed by CORS/.test(err.message)) {
    status = 403
  }

  // Include stack trace in dev only
  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack
  }

  // Log
  if (status >= 500) {
    logger.error({ err }, 'Server error')
  } else {
    logger.warn({ err }, 'Client error')
  }

  res.status(status).json(payload)
}
