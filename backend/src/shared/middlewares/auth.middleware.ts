import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/UnauthorizedError.js';
import { verifyToken } from '../services/auth.service.js';
import { resolveUser } from '../services/user-resolver.js';

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

  // ban check: JWT válido hasta 1h post-ban, hasta que refresquen
  const dbUser = await resolveUser(user.id, user.role);

  if (!dbUser || !dbUser.isActive) {
    throw new UnauthorizedError('User is banned');
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: dbUser.role,
  };

  next();
}
