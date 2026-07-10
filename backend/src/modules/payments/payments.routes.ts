import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import * as ctrl from './payments.controller.js';

export const paymentsRouter = Router();

paymentsRouter.post('/checkout', authMiddleware, ctrl.handleCheckout);
paymentsRouter.post('/payments/webhook/:provider', ctrl.handleWebhook);
paymentsRouter.get('/payments/:id/status', authMiddleware, ctrl.handleGetPaymentStatus);
