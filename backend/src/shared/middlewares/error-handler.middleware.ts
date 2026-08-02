import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../../utils/logger.js';

export function errorHandler(
  err: Error & {
    statusCode?: number;
    code?: string;
    data?: unknown;
    meta?: { target?: string[] | string };
  },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error(err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target)
        ? err.meta?.target
        : err.meta?.target
          ? [err.meta.target as string]
          : [];
      const isCedula = target.includes('cedula');

      res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: isCedula
            ? 'La cédula ya está registrada por otro usuario'
            : 'Unique constraint violated',
          data: { target },
        },
      });
      return;
    }
  }

  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';
  const message =
    statusCode === 500 ? 'An unexpected error occurred' : err.message;

  if (statusCode === 429 && (err as { retryAfter?: number }).retryAfter) {
    res.setHeader(
      'Retry-After',
      String((err as { retryAfter?: number }).retryAfter),
    );
  }

  res.status(statusCode).json({
    error: { code, message, ...(err.data ? { data: err.data } : {}) },
  });
}
