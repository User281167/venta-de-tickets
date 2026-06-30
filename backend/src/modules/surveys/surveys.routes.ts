import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import * as surveysController from './surveys.controller.js';

const surveysRouter = Router();

// Todas las rutas de encuesta requieren autenticación.
surveysRouter.use(authMiddleware);
surveysRouter.post('/onboarding', surveysController.submitOnboardingSurvey);

export { surveysRouter };
