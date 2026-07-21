import cors from 'cors';
import express from 'express';
import { env } from './shared/config/env.js';
import { errorHandler } from './shared/middlewares/error-handler.middleware.js';
import { meRouter } from './modules/me/index.js';
import { usersRouter } from './modules/users/index.js';

import { adminsRouter } from './modules/admins/admins.routes.js';
import { authRouter } from './modules/auth/index.js';
import {
  ticketsRouter,
  adminTicketsRouter,
} from './modules/tickets/tickets.routes.js';
import { paymentsRouter } from './modules/payments/index.js';
import { checkinRouter } from './modules/checkin/index.js';
import { confirmationsRouter } from './modules/confirmations/confirmations.routes.js';

import { logger } from './utils/logger.js';

export const app = express();

app.set('trust proxy', 1);
const allowedOrigins = env.CORS_ORIGIN.split(',');
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Middleware de logging en Express
app.use((req, res, next) => {
  req.log = logger.child({ requestId: crypto.randomUUID() });
  req.log.info({ method: req.method, url: req.url }, 'Request received');

  res.on('finish', () => {
    req.log.info({ statusCode: res.statusCode }, 'Request completed');
  });

  next();
});

app.use('/api/me', meRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/admin/tickets', adminTicketsRouter);
app.use('/api/users', usersRouter);
app.use('/api', paymentsRouter);
app.use('/internal/checkin', checkinRouter);
app.use('/confirmations', confirmationsRouter);

app.use(errorHandler);
