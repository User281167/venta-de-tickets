import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { rateLimit } from '../../shared/middlewares/rate-limit.middleware.js';
import { POLICIES } from '../../shared/middlewares/rate-limit.policies.js';
import * as ctrl from './tickets.controller.js';
import { requireRole } from '../../shared/middlewares/require-role.middleware.js';

export const ticketsRouter = Router();

ticketsRouter.get('/', rateLimit(POLICIES.publicRead), ctrl.list);
ticketsRouter.get('/:id', rateLimit(POLICIES.publicRead), ctrl.getById);

export const adminTicketsRouter = Router();

adminTicketsRouter.use(authMiddleware);

adminTicketsRouter.get(
  '/',
  requireRole('admin', 'super_admin'),
  rateLimit(POLICIES.admin),
  ctrl.adminList,
);
adminTicketsRouter.post(
  '/',
  requireRole('admin'),
  rateLimit(POLICIES.admin),
  ctrl.create,
);
adminTicketsRouter.patch(
  '/:id',
  requireRole('admin'),
  rateLimit(POLICIES.admin),
  ctrl.update,
);
