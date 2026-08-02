import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/require-role.middleware.js';
import { rateLimit } from '../../shared/middlewares/rate-limit.middleware.js';
import { POLICIES } from '../../shared/middlewares/rate-limit.policies.js';
import * as ctrl from './checkin.controller.js';

export const checkinRouter = Router();

checkinRouter.use(
  authMiddleware,
  requireRole('checker', 'admin'),
  rateLimit(POLICIES.client),
);

checkinRouter.post('/scan', ctrl.scan);
checkinRouter.post('/confirm-entry', ctrl.confirmEntry);
checkinRouter.post('/request-confirmation', ctrl.requestConfirmationHandler);
checkinRouter.post('/allow-entry', ctrl.allowEntryHandler);
