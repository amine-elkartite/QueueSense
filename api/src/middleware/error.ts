import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export const notFoundMiddleware: RequestHandler = (req, res) =>
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });

export const globalErrorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  void next;

  const appError =
    err instanceof AppError
      ? err
      : new AppError(500, 'INTERNAL_ERROR', 'Internal server error');

  logger.error('API error', {
    method: req.method,
    path: req.path,
    code: appError.code,
    message: err instanceof Error ? err.message : String(err),
  });

  res.status(appError.statusCode).json({
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details ? { details: appError.details } : {}),
    },
    ...(env.NODE_ENV === 'development' && !(err instanceof AppError)
      ? { debug: 'See server logs' }
      : {}),
  });
};
