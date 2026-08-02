import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { rateLimit } from '../../shared/middlewares/rate-limit.middleware.js';
import { POLICIES } from '../../shared/middlewares/rate-limit.policies.js';
import * as meController from './me.controller.js';
import * as ticketController from '../tickets/tickets.controller.js';
import * as paymentController from '../payments/payments.controller.js';

const meRouter = Router();

meRouter.use(authMiddleware);

meRouter.get('/', rateLimit(POLICIES.client), meController.meHandler);
meRouter.get(
  '/personal-info',
  rateLimit(POLICIES.client),
  meController.getPersonalInfoHandler,
);
meRouter.put(
  '/personal-info',
  rateLimit(POLICIES.clientWrite),
  meController.setPersonalInfoHandler,
);
meRouter.patch(
  '/personal-info',
  rateLimit(POLICIES.clientWrite),
  meController.setPersonalInfoHandler,
);

meRouter.get(
  '/tickets',
  rateLimit(POLICIES.client),
  ticketController.listMyTicketsHandler,
);
meRouter.get(
  '/tickets/:id',
  rateLimit(POLICIES.client),
  ticketController.getMyTicketByIdHandler,
);
meRouter.post(
  '/tickets/:id/confirm',
  rateLimit(POLICIES.clientWrite),
  meController.confirmMyTicketHandler,
);
meRouter.post(
  '/tickets/:id/reject',
  rateLimit(POLICIES.clientWrite),
  meController.rejectMyTicketHandler,
);
meRouter.get(
  '/payments',
  rateLimit(POLICIES.client),
  paymentController.listMyPaymentsHandler,
);

export { meRouter };
