import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../errors/UnauthorizedError.js';

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header) {
    throw new UnauthorizedError('Missing Authorization header');
  }

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new UnauthorizedError('Invalid Authorization header format');
  }

  const token = parts[1];

  try {
    const payload = jwt.verify(token, env.SUPABASE_JWT_SECRET) as {
      sub?: string;
      email?: string;
    };

    if (!payload.sub || !payload.email) {
      throw new UnauthorizedError('Token missing required claims');
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      throw err;
    }
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token has expired');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw new UnauthorizedError('Token verification failed');
  }
}
