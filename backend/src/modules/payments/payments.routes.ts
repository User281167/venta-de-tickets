import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import * as ctrl from './payments.controller.js';

export const paymentsRouter = Router();

paymentsRouter.post('/payments/checkout', authMiddleware, ctrl.handleCheckout);
paymentsRouter.post('/payments/webhook/:provider', ctrl.handleWebhook);
paymentsRouter.get('/payments/epayco/status/:paymentId', authMiddleware, ctrl.handleEpaycoStatus);
paymentsRouter.get('/payments/epayco/status-by-ref/:refPayco', ctrl.handleEpaycoStatusByRef);
paymentsRouter.get('/payments/:id/status', authMiddleware, ctrl.handleGetPaymentStatus);
