import cors from 'cors';
import express from 'express';
import { env } from './shared/config/env.js';
import { errorHandler } from './shared/middlewares/error-handler.middleware.js';
import { meRouter } from './modules/me/index.js';
import { usersRouter } from './modules/users/index.js';

import { adminsRouter } from './modules/admins/admins.routes.js';
import { authRouter } from './modules/auth/index.js';
import { ticketsRouter } from './modules/tickets/tickets.routes.js';

export const app = express();

app.set('trust proxy', 1);
const allowedOrigins = env.CORS_ORIGIN.split(',');
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use('/api/me', meRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/users', usersRouter);

app.use(errorHandler);
