import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../../shared/config/env.js';
import { InvalidTokenError } from '../../shared/errors/InvalidTokenError.js';
import type { ConfirmationTokenPayload } from './confirmations.types.js';

const { TokenExpiredError, JsonWebTokenError } = jwt;

export function verifyConfirmationToken(token: string): string {
  try {
    const payload = jwt.verify(
      token,
      env.CONFIRMATION_JWT_SECRET,
    ) as ConfirmationTokenPayload;

    if (payload.purpose !== 'confirm' || !payload.tid) {
      throw new InvalidTokenError('Token is not a confirmation token');
    }

    return payload.tid;
  } catch (error) {
    if (error instanceof InvalidTokenError) throw error;

    if (error instanceof TokenExpiredError) {
      throw new InvalidTokenError('Confirmation link has expired');
    }

    if (error instanceof JsonWebTokenError) {
      throw new InvalidTokenError('Invalid confirmation link');
    }

    throw new InvalidTokenError('Invalid confirmation link');
  }
}

export function confirmationAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token =
    typeof req.body?.token === 'string' ? req.body.token : undefined;

  if (!token) {
    throw new InvalidTokenError('Token is required');
  }

  const ticketId = verifyConfirmationToken(token);
  req.confirmation = { ticketId };
  next();
}
