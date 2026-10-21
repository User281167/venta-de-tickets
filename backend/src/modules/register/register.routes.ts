import { Router } from 'express';
import { rateLimit } from '../../shared/middlewares/rate-limit.middleware.js';
import { POLICIES } from '../../shared/middlewares/rate-limit.policies.js';
import {
  getRegister,
  registerEvent,
  setRegisterConfirmation,
} from './register.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/require-role.middleware.js';

const registerRoute = Router();

registerRoute.put('/', rateLimit(POLICIES.publicWrite), registerEvent);

const verifyRegisterRoute = Router();
verifyRegisterRoute.use(authMiddleware);

verifyRegisterRoute.get(
  '/:cedula',
  requireRole('admin', 'super_admin', 'checker'),
  rateLimit(POLICIES.admin),
  getRegister,
);

verifyRegisterRoute.patch(
  '/:cedula/confirmation',
  requireRole('admin', 'super_admin', 'checker'),
  rateLimit(POLICIES.admin),
  setRegisterConfirmation,
);

export { registerRoute as registerRouter, verifyRegisterRoute };
