import type { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const FIVE_MINUTES = 5 * 60 * 1000;
const MAX_REQUESTS = 10;

export function rateLimiter(maxRequests = MAX_REQUESTS, windowMs = FIVE_MINUTES) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    entry.count++;

    if (entry.count > maxRequests) {
      res.status(429).json({
        error: { code: 'RATE_LIMIT', message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' },
      });
      return;
    }

    next();
  };
}