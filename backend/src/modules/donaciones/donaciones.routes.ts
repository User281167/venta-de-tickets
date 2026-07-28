import { Router } from 'express';

import * as ctrl from './donaciones.controller.js';

export const donacionesRouter = Router();

donacionesRouter.post('/', ctrl.createDonation);
donacionesRouter.post(
  '/webhook/mercadopago-la-convencion',
  ctrl.handleLaConvencionWebhook,
);
donacionesRouter.get('/:externalReference/status', ctrl.getStatus);