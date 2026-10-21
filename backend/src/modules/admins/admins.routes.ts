import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/require-role.middleware.js';
import { rateLimit } from '../../shared/middlewares/rate-limit.middleware.js';
import { POLICIES } from '../../shared/middlewares/rate-limit.policies.js';
import * as adminsController from './admins.controller.js';
import * as donacionesController from '../donaciones/donaciones.controller.js';

const adminsRouter = Router();

adminsRouter.use(authMiddleware);

adminsRouter.get(
  '/users',
  requireRole('admin', 'super_admin'),
  rateLimit(POLICIES.admin),
  adminsController.listUsers,
);

adminsRouter.post(
  '/users',
  requireRole('admin', 'super_admin'),
  rateLimit(POLICIES.admin),
  adminsController.createUser,
);

adminsRouter.post(
  '/users/batch',
  requireRole('admin', 'super_admin'),
  rateLimit(POLICIES.admin),
  adminsController.batchCreateUsers,
);

adminsRouter.patch(
  '/users/:id',
  requireRole('admin', 'super_admin'),
  rateLimit(POLICIES.admin),
  adminsController.updateUser,
);

adminsRouter.get(
  '/me',
  requireRole('admin', 'super_admin'),
  rateLimit(POLICIES.admin),
  adminsController.getMe,
);

adminsRouter.get(
  '/donations',
  requireRole('admin', 'super_admin'),
  rateLimit(POLICIES.admin),
  donacionesController.listDonations,
);

adminsRouter.put(
  '/donations/counter',
  requireRole('admin', 'super_admin'),
  rateLimit(POLICIES.admin),
  donacionesController.updateCounter,
);

export { adminsRouter };
