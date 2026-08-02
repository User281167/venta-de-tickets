import { Router } from 'express';

import { rateLimit } from '../../shared/middlewares/rate-limit.middleware.js';
import { POLICIES } from '../../shared/middlewares/rate-limit.policies.js';
import { verifyDonationsWebhookSignature } from '../../shared/middlewares/donation-webhook-signature.middleware.js';

import * as ctrl from './donaciones.controller.js';

export const donacionesRouter = Router();

donacionesRouter.post('/', rateLimit(POLICIES.publicWrite), ctrl.createDonation);
donacionesRouter.post(
  '/webhook/mercadopago-la-convencion',
  verifyDonationsWebhookSignature('mercadopago-la-convencion'),
  rateLimit(POLICIES.webhookGlobal),
  ctrl.handleLaConvencionWebhook,
);
donacionesRouter.post(
  '/webhook/mercadopago-barranqueros-utp',
  verifyDonationsWebhookSignature('mercadopago-barranqueros-utp'),
  rateLimit(POLICIES.webhookGlobal),
  ctrl.handleBarranquerosWebhook,
);
donacionesRouter.post(
  '/webhook/epayco-la-convencion',
  verifyDonationsWebhookSignature('epayco-la-convencion'),
  rateLimit(POLICIES.webhookGlobal),
  ctrl.handleEpaycoLaConvencionWebhook,
);
donacionesRouter.post(
  '/webhook/epayco-barranqueros-utp',
  verifyDonationsWebhookSignature('epayco-barranqueros-utp'),
  rateLimit(POLICIES.webhookGlobal),
  ctrl.handleEpaycoBarranquerosWebhook,
);
donacionesRouter.get(
  '/:externalReference/status',
  rateLimit(POLICIES.publicRead),
  ctrl.getStatus,
);
