import cors from 'cors';
import express from 'express';
import { authMiddleware } from './shared/middlewares/auth.middleware.js';
import { errorHandler } from './shared/middlewares/error-handler.middleware.js';
import { meHandler } from './modules/me/me.controller.js';
import { usersRouter } from './modules/users/index.js';
import { surveysRouter } from './modules/surveys/surveys.routes.js';
import { adminsRouter } from './modules/admins/admins.routes.js';
import { authRouter } from './modules/auth/index.js';
import {
  publicEventRouter,
  publicTicketTypesRouter,
  adminTicketTypesRouter,
} from './modules/ticket-types/ticket-types.routes.js';

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
app.use('/api/ticket-types', publicTicketTypesRouter);
app.use('/api/events', publicEventRouter);
app.use('/api/admin', adminTicketTypesRouter);
app.use('/api/users', usersRouter);
app.use('/api/surveys', surveysRouter);

app.use(errorHandler);
