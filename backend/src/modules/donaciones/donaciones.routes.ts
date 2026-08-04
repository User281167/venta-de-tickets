import { Router } from 'express';

import { rateLimit } from '../../shared/middlewares/rate-limit.middleware.js';
import { POLICIES } from '../../shared/middlewares/rate-limit.policies.js';
import { verifyDonationsWebhookSignature } from '../../shared/middlewares/donation-webhook-signature.middleware.js';

import * as ctrl from './donaciones.controller.js';

export const donacionesRouter = Router();

donacionesRouter.post('/', rateLimit(POLICIES.publicWrite), ctrl.createDonation);
donacionesRouter.post(
  '/webhook/:provider',
  verifyDonationsWebhookSignature,
  rateLimit(POLICIES.webhookGlobal),
  ctrl.handleWebhook,
);
donacionesRouter.get(
  '/:externalReference/status',
  rateLimit(POLICIES.publicRead),
  ctrl.getStatus,
);
