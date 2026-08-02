import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { rateLimit } from '../../shared/middlewares/rate-limit.middleware.js';
import { POLICIES } from '../../shared/middlewares/rate-limit.policies.js';
import { verifyPaymentsWebhookSignature } from '../../shared/middlewares/webhook-signature.middleware.js';
import * as ctrl from './payments.controller.js';

export const paymentsRouter = Router();

paymentsRouter.post(
  '/payments/checkout',
  authMiddleware,
  rateLimit(POLICIES.clientWrite),
  ctrl.handleCheckout,
);
paymentsRouter.post(
  '/payments/webhook/:provider',
  verifyPaymentsWebhookSignature,
  rateLimit(POLICIES.webhookGlobal),
  ctrl.handleWebhook,
);
paymentsRouter.get(
  '/payments/epayco/status/:paymentId',
  authMiddleware,
  rateLimit(POLICIES.client),
  ctrl.handleEpaycoStatus,
);
paymentsRouter.get(
  '/payments/epayco/status-by-ref/:refPayco',
  rateLimit(POLICIES.publicRead),
  ctrl.handleEpaycoStatusByRef,
);
paymentsRouter.get(
  '/payments/:id/status',
  authMiddleware,
  rateLimit(POLICIES.client),
  ctrl.handleGetPaymentStatus,
);
