import cors from 'cors';
import express from 'express';
import { authMiddleware } from './shared/middlewares/auth.middleware.ts';
import { adminMiddleware } from './shared/middlewares/admin.middleware.ts';
import { errorHandler } from './shared/middlewares/error-handler.middleware.ts';
import { meHandler } from './modules/me/me.controller.ts';
import { adminPingHandler } from './modules/admins/admin-ping.controller.ts';
import { usersRouter } from './modules/users/index.ts';
import { surveysRouter } from './modules/surveys/surveys.routes.ts';

export const app = express();

app.set('trust proxy', 1);
const allowedOrigins = process.env['CORS_ORIGIN']
  ? process.env['CORS_ORIGIN'].split(',')
  : ['http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.get('/api/me', authMiddleware, meHandler);
app.get('/api/admin/ping', authMiddleware, adminMiddleware, adminPingHandler);
app.use('/api/users', usersRouter);
app.use('/api/surveys', surveysRouter);

app.use(errorHandler);
