import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/require-role.middleware.js';
import * as adminsController from './admins.controller.js';
import * as donacionesController from '../donaciones/donaciones.controller.js';

const adminsRouter = Router();

adminsRouter.use(authMiddleware);

adminsRouter.get('/me', adminsController.getMe);
adminsRouter.get('/users', requireRole('admin', 'super_admin'), adminsController.listUsers);
adminsRouter.post('/users', requireRole('admin'), adminsController.createUser);
adminsRouter.post('/users/batch', requireRole('admin'), adminsController.batchCreateUsers);
adminsRouter.patch('/users/:id', requireRole('admin'), adminsController.updateUser);

adminsRouter.get('/payments', requireRole('admin', 'super_admin'), adminsController.listPaymentsHandler);
adminsRouter.get('/payments/:id', requireRole('admin', 'super_admin'), adminsController.getPaymentDetailHandler);
adminsRouter.post('/payments/:id/refund', requireRole('admin'), adminsController.refundPaymentHandler);
adminsRouter.post('/payments/manual', requireRole('admin'), adminsController.createAdminPaymentHandler);

adminsRouter.get('/donations', requireRole('admin', 'super_admin'), donacionesController.listDonations);

export { adminsRouter };
