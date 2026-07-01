import type { Request, Response, NextFunction } from 'express';
import type { AdminRole } from '../../modules/admins/admins.types.js';
import { ForbiddenError } from '../errors/ForbiddenError.js';

export function requireRole(...roles: AdminRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.admin) {
      throw new ForbiddenError('Admin access required');
    }

    if (!roles.includes(req.admin.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
}
