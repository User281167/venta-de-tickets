import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/ForbiddenError.js';

const ADMIN_ROLES = ['super_admin', 'organizer', 'staff', 'checker'];

export function adminMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user?.role || !ADMIN_ROLES.includes(req.user.role)) {
    throw new ForbiddenError('Admin access required');
  }

  next();
}
