import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { rateLimit } from '../../shared/middlewares/rate-limit.middleware.js';
import { POLICIES } from '../../shared/middlewares/rate-limit.policies.js';
import { requireRole } from '../../shared/middlewares/require-role.middleware.js';
import { sessionHandler } from './auth.controller.js';

const authRouter = Router();

authRouter.get(
  '/session',
  authMiddleware,
  requireRole('admin', 'super_admin', 'checker'),
  rateLimit(POLICIES.client),
  sessionHandler,
);

export { authRouter };
