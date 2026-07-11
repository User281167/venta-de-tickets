import jwt from 'jsonwebtoken';
import { env } from '../../shared/config/env.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import * as checkinRepo from './checkin.repository.js';

import { logger } from '../../utils/logger.js';

export async function checkIn(qrToken: string, checkerId: string) {
  logger.info(`Check-in attempt: qrToken=${qrToken}, checkerId=${checkerId}`);
  let decoded: { tid: string };

  try {
    decoded = jwt.verify(qrToken, env.QR_JWT_SECRET) as { tid: string };
  } catch {
    logger.error(`Invalid or tampered QR code: qrToken=${qrToken}`);
    throw Object.assign(new Error('Invalid or tampered QR code'), {
      statusCode: 400,
      code: 'INVALID_QR',
    });
  }

  const result = await checkinRepo.checkInDirect(decoded.tid, checkerId);

  if (result.action === 'not_found') {
    logger.warn(`Ticket not found: tid=${decoded.tid}`);
    throw new NotFoundError('Ticket not found');
  }

  if (result.action === 'already_used') {
    logger.warn(`Ticket is already checked in: tid=${decoded.tid}`);

    throw Object.assign(new Error('Ticket is already checked in'), {
      statusCode: 409,
      code: 'TICKET_NOT_AVAILABLE',
      currentStatus: 'used',
    });
  }

  if (result.action === 'wrong_status') {
    logger.warn(`Ticket is not in valid status for check-in: tid=${decoded.tid}, currentStatus=${result.currentStatus}`);

    throw Object.assign(
      new Error('Ticket is not in valid status for check-in'),
      {
        statusCode: 409,
        code: 'TICKET_NOT_AVAILABLE',
        currentStatus: result.currentStatus,
      },
    );
  }

  logger.info(`Ticket checked in successfully: tid=${decoded.tid}, checkerId=${checkerId}`);

  return {
    success: true,
    ticket: {
      id: result.ticket.id,
    },
  };
}
