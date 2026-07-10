import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/require-role.middleware.js';
import * as ctrl from './checkin.controller.js';

export const checkinRouter = Router();

checkinRouter.use(authMiddleware);
checkinRouter.post('/internal/checkin', requireRole('checker', 'admin'), ctrl.handleCheckIn);
