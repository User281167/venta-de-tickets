import { Router } from 'express';

import { rateLimiter } from '../../shared/middlewares/rate-limiter.middleware.js';

import * as ctrl from './donaciones.controller.js';

export const donacionesRouter = Router();

donacionesRouter.post('/', rateLimiter(), ctrl.createDonation);
donacionesRouter.post(
  '/webhook/mercadopago-la-convencion',
  ctrl.handleLaConvencionWebhook,
);
donacionesRouter.post(
  '/webhook/mercadopago-barranqueros-utp',
  ctrl.handleBarranquerosWebhook,
);
donacionesRouter.post(
  '/webhook/epayco-la-convencion',
  ctrl.handleEpaycoLaConvencionWebhook,
);
donacionesRouter.post(
  '/webhook/epayco-barranqueros-utp',
  ctrl.handleEpaycoBarranquerosWebhook,
);
donacionesRouter.get('/:externalReference/status', ctrl.getStatus);
