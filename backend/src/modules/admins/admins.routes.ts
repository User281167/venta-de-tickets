import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../shared/middlewares/admin.middleware.js';
import { requireRole } from '../../shared/middlewares/require-role.middleware.js';
import * as adminsController from './admins.controller.js';

const adminsRouter = Router();

adminsRouter.use(authMiddleware, adminMiddleware);

adminsRouter.get('/me', adminsController.getMe);
adminsRouter.get('/users', requireRole('admin'), adminsController.listUsers);
adminsRouter.post('/users', requireRole('admin'), adminsController.createUser);
adminsRouter.post('/users/batch', requireRole('admin'), adminsController.batchCreateUsers);
adminsRouter.patch('/users/:id', requireRole('admin'), adminsController.updateUser);

adminsRouter.get('/payments', requireRole('admin'), adminsController.listPaymentsHandler);
adminsRouter.get('/payments/:id', requireRole('admin'), adminsController.getPaymentDetailHandler);
adminsRouter.post('/sales', requireRole('admin'), adminsController.createSaleHandler);

export { adminsRouter };
