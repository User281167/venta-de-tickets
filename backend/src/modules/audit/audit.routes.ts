import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/require-role.middleware.js';
import * as ctrl from './audit.controller.js';

export const auditRouter = Router();

auditRouter.use(authMiddleware, requireRole('super_admin'));

auditRouter.get('/', ctrl.listAuditLog);
