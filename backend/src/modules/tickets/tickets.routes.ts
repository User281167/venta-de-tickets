import { Router } from 'express';
import * as ctrl from './tickets.controller.js';

export const ticketsRouter = Router();

ticketsRouter.get('/', ctrl.list);
ticketsRouter.get('/:id', ctrl.getById);
