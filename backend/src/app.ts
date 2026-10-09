import cors from 'cors';
import express from 'express';
import { env } from './shared/config/env.js';
import { errorHandler } from './shared/middlewares/error-handler.middleware.js';
import { adminsRouter } from './modules/admins/admins.routes.js';
import { authRouter } from './modules/auth/index.js';
import { donacionesRouter } from './modules/donaciones/donaciones.routes.js';

import { logger } from './utils/logger.js';

export const app = express();

app.set('trust proxy', 1);
const allowedOrigins = env.CORS_ORIGIN.split(',');
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging en Express
app.use((req, res, next) => {
  req.log = logger.child({ requestId: crypto.randomUUID() });
  req.log.info({ method: req.method, url: req.url }, 'Request received');

  res.on('finish', () => {
    req.log.info({ statusCode: res.statusCode }, 'Request completed');
  });

  next();
});

app.use('/api/auth', authRouter);
app.use('/api/admin', adminsRouter);
app.use('/api/donaciones', donacionesRouter);

app.use(errorHandler);
