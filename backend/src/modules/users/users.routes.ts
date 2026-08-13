import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { rateLimit } from '../../shared/middlewares/rate-limit.middleware.js';
import { POLICIES } from '../../shared/middlewares/rate-limit.policies.js';
import * as usersController from './users.controller.js';
import { acceptPoliciesSchema } from './users.validators.js';

const usersRouter = Router();

usersRouter.get(
  '/policies/:type',
  rateLimit(POLICIES.client),
  usersController.getPolicyContent,
);

usersRouter.use(authMiddleware);

usersRouter.post(
  '/me/policy-acceptance',
  rateLimit(POLICIES.clientWrite),
  (req, res, next) => {
    const parsed = acceptPoliciesSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues.map((i) => i.message).join(', '),
        },
      });

      return;
    }

    req.body = parsed.data;
    next();
  },

  usersController.acceptPolicies,
);

usersRouter.get(
  '/me/policy-status',
  rateLimit(POLICIES.client),
  usersController.getPolicyStatus,
);

export { usersRouter };
