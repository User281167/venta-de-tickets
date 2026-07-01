import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../shared/middlewares/admin.middleware.js';
import { requireRole } from '../../shared/middlewares/require-role.middleware.js';
import * as adminsController from './admins.controller.js';

const adminsRouter = Router();

adminsRouter.use(authMiddleware, adminMiddleware);

adminsRouter.get('/me', adminsController.getMe);
adminsRouter.get(
  '/users',
  requireRole('super_admin', 'organizer'),
  adminsController.listUsers,
);
adminsRouter.get(
  '/surveys/onboarding',
  requireRole('super_admin', 'organizer'),
  adminsController.listOnboardingSurveys,
);

export { adminsRouter };
