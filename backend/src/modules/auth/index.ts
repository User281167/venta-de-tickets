import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { sessionHandler } from './auth.controller.js';

const authRouter = Router();

authRouter.get('/session', authMiddleware, sessionHandler);

export { authRouter };
