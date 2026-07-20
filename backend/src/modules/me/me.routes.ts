import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import * as meController from './me.controller.js';
import * as ticketController from '../tickets/tickets.controller.js'
import * as paymentController from '../payments/payments.controller.js'

const meRouter = Router();

meRouter.use(authMiddleware);

meRouter.get('/', meController.meHandler);
meRouter.get('/personal-info', meController.getPersonalInfoHandler);
meRouter.put('/personal-info', meController.setPersonalInfoHandler);
meRouter.patch('/personal-info', meController.setPersonalInfoHandler);

meRouter.get('/tickets', ticketController.listMyTicketsHandler);
meRouter.get('/tickets/:id', ticketController.getMyTicketByIdHandler);
meRouter.get('/payments', paymentController.listMyPaymentsHandler);

export { meRouter };
