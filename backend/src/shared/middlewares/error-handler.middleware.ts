import type { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger.js';


export function errorHandler(
  err: Error & { statusCode?: number; code?: string; data?: unknown },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error(err);

  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';
  const message =
    statusCode === 500 ? 'An unexpected error occurred' : err.message;

  res.status(statusCode).json({
    error: { code, message, ...(err.data ? { data: err.data } : {}) },
  });
}
