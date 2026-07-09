import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../shared/middlewares/admin.middleware.js';
import * as ctrl from './tickets.controller.js';

export const ticketsRouter = Router();

ticketsRouter.get('/', ctrl.list);
ticketsRouter.get('/:id', ctrl.getById);

export const adminTicketsRouter = Router();

adminTicketsRouter.use(authMiddleware, adminMiddleware);

adminTicketsRouter.get('/', ctrl.adminList);
adminTicketsRouter.post('/', ctrl.create);
adminTicketsRouter.patch('/:id', ctrl.update);
