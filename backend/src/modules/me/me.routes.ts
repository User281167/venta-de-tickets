import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/require-role.middleware.js';
import * as meController from './me.controller.js';
import * as ticketController from '../tickets/tickets.controller.js'
import * as paymentController from '../payments/payments.controller.js'

const meRouter = Router();

meRouter.use(authMiddleware);

meRouter.get('/', meController.meHandler);
meRouter.get('/personal-info', meController.getPersonalInfoHandler);
meRouter.put('/personal-info', requireRole('client'), meController.setPersonalInfoHandler);
meRouter.patch('/personal-info', requireRole('client'), meController.setPersonalInfoHandler);

meRouter.get('/tickets', requireRole('client'), ticketController.listMyTicketsHandler);
meRouter.get('/tickets/:id', requireRole('client'), ticketController.getMyTicketByIdHandler);
meRouter.get('/payments', requireRole('client'), paymentController.listMyPaymentsHandler);

export { meRouter };
