import express from 'express';
import { authMiddleware } from './shared/middlewares/auth.middleware.js';
import { adminMiddleware } from './shared/middlewares/admin.middleware.js';
import { errorHandler } from './shared/middlewares/error-handler.middleware.js';
import { meHandler } from './modules/me/me.controller.js';
import { adminPingHandler } from './modules/admins/admin-ping.controller.js';

export const app = express();

app.use(express.json());

app.get('/api/me', authMiddleware, meHandler);
app.get('/api/admin/ping', authMiddleware, adminMiddleware, adminPingHandler);

app.use(errorHandler);
