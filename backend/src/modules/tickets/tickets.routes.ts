import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import * as ctrl from './tickets.controller.js';
import { requireRole } from '../../shared/middlewares/require-role.middleware.js';

export const ticketsRouter = Router();

ticketsRouter.get('/', ctrl.list);
ticketsRouter.get('/:id', ctrl.getById);

export const adminTicketsRouter = Router();

adminTicketsRouter.use(authMiddleware);

adminTicketsRouter.get('/', requireRole('admin', 'super_admin'), ctrl.adminList);
adminTicketsRouter.post('/', requireRole('admin'), ctrl.create);
adminTicketsRouter.patch('/:id', requireRole('admin'), ctrl.update);
