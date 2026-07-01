import cors from 'cors';
import express from 'express';
import { authMiddleware } from './shared/middlewares/auth.middleware.ts';
import { errorHandler } from './shared/middlewares/error-handler.middleware.ts';
import { meHandler } from './modules/me/me.controller.ts';
import { usersRouter } from './modules/users/index.ts';
import { surveysRouter } from './modules/surveys/surveys.routes.ts';
import { adminsRouter } from './modules/admins/admins.routes.ts';
import { authRouter } from './modules/auth/index.ts';

export const app = express();

app.set('trust proxy', 1);
const allowedOrigins = process.env['CORS_ORIGIN']
  ? process.env['CORS_ORIGIN'].split(',')
  : ['http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.get('/api/me', authMiddleware, meHandler);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminsRouter);
app.use('/api/users', usersRouter);
app.use('/api/surveys', surveysRouter);

app.use(errorHandler);
