import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/require-role.middleware.js';
import { rateLimit } from '../../shared/middlewares/rate-limit.middleware.js';
import { POLICIES } from '../../shared/middlewares/rate-limit.policies.js';
import * as ctrl from './audit.controller.js';

export const auditRouter = Router();

auditRouter.use(
  authMiddleware,
  requireRole('super_admin'),
  rateLimit(POLICIES.superAdmin),
);

auditRouter.get('/', ctrl.listAuditLog);
