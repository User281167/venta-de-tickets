import { Router } from 'express';

import { confirmationAuthMiddleware } from './confirmations.middleware.js';
import * as ctrl from './confirmations.controller.js';

export const confirmationsRouter = Router();

confirmationsRouter.post('/confirm', confirmationAuthMiddleware, ctrl.confirm);
confirmationsRouter.post('/reject', confirmationAuthMiddleware, ctrl.reject);
