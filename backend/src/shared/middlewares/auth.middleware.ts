import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/UnauthorizedError.js';
import { verifyToken } from '../services/auth.service.js';

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;

  if (!header) {
    throw new UnauthorizedError('Missing Authorization header');
  }

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new UnauthorizedError('Invalid Authorization header format');
  }

  const token = parts[1];

  if (!token) {
    throw new UnauthorizedError('Token is empty');
  }

  const user = await verifyToken(token);

  req.user = {
    id: user.id,
    email: user.email,
  };

  next();
}
