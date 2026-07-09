import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import * as usersController from './users.controller.js';

const usersRouter = Router();

usersRouter.use(authMiddleware);

usersRouter.post('/me/privacy-acceptance', usersController.acceptPrivacy);
usersRouter.get('/me/privacy-status', usersController.getPrivacyStatus);

export { usersRouter };
