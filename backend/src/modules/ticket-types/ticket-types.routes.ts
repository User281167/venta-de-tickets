import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../shared/middlewares/admin.middleware.js';
import { requireRole } from '../../shared/middlewares/require-role.middleware.js';
import * as ctrl from './ticket-types.controller.js';

export const publicTicketTypesRouter = Router();

publicTicketTypesRouter.get('/', ctrl.listActiveTicketTypes);

export const publicEventRouter = Router();

publicEventRouter.get('/', ctrl.listPublishedEvents);
publicEventRouter.get('/:eventId', ctrl.getEventWithAvailability);

export const adminTicketTypesRouter = Router();

adminTicketTypesRouter.use(authMiddleware, adminMiddleware);

adminTicketTypesRouter.get(
  '/:eventId/ticket-types',
  requireRole('super_admin', 'organizer'),
  ctrl.listTicketTypes,
);
adminTicketTypesRouter.post(
  '/:eventId/ticket-types',
  requireRole('super_admin', 'organizer'),
  ctrl.createTicketType,
);
adminTicketTypesRouter.patch(
  '/ticket-types/:id',
  requireRole('super_admin', 'organizer'),
  ctrl.updateTicketType,
);
adminTicketTypesRouter.delete(
  '/ticket-types/:id',
  requireRole('super_admin', 'organizer'),
  ctrl.deactivateTicketType,
);
