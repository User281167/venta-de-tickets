import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/UnauthorizedError.js';
import { ForbiddenError } from '../errors/ForbiddenError.js';
import { findByUserId } from '../../modules/admins/admins.repository.js';

export async function adminMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const admin = await findByUserId(req.user.id);

  if (!admin || !admin.isActive) {
    throw new ForbiddenError('Admin access required');
  }

  next();
}
