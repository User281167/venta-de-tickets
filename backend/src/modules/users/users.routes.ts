import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { rateLimit } from '../../shared/middlewares/rate-limit.middleware.js';
import { POLICIES } from '../../shared/middlewares/rate-limit.policies.js';
import * as usersController from './users.controller.js';

const usersRouter = Router();

usersRouter.use(authMiddleware);

usersRouter.post(
  '/me/privacy-acceptance',
  rateLimit(POLICIES.clientWrite),
  usersController.acceptPrivacy,
);
usersRouter.get(
  '/me/privacy-status',
  rateLimit(POLICIES.client),
  usersController.getPrivacyStatus,
);

export { usersRouter };
