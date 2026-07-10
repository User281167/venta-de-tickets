import jwt from 'jsonwebtoken';
import { env } from '../../shared/config/env.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import * as checkinRepo from './checkin.repository.js';

export async function checkIn(qrToken: string, checkerId: string) {
  let decoded: { tid: string };

  try {
    decoded = jwt.verify(qrToken, env.QR_JWT_SECRET) as { tid: string };
  } catch {
    throw Object.assign(new Error('Invalid or tampered QR code'), {
      statusCode: 400,
      code: 'INVALID_QR',
    });
  }

  const result = await checkinRepo.checkInDirect(decoded.tid, checkerId);

  if (result.action === 'not_found') {
    throw new NotFoundError('Ticket not found');
  }

  if (result.action === 'already_used') {
    throw Object.assign(new Error('Ticket is already checked in'), {
      statusCode: 409,
      code: 'TICKET_NOT_AVAILABLE',
      currentStatus: 'used',
    });
  }

  if (result.action === 'wrong_status') {
    throw Object.assign(
      new Error('Ticket is not in valid status for check-in'),
      {
        statusCode: 409,
        code: 'TICKET_NOT_AVAILABLE',
        currentStatus: result.currentStatus,
      },
    );
  }

  return {
    success: true,
    ticket: {
      id: result.ticket.id,
    },
  };
}
