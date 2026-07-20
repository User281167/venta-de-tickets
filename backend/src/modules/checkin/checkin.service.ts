import jwt, { type JwtPayload } from 'jsonwebtoken';

import { env } from '../../shared/config/env.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';
import { logger } from '../../utils/logger.js';

import * as checkinRepo from './checkin.repository.js';
import { getAllowedActions, type TicketSummary } from './checkin.types.js';

class InvalidQrError extends Error {
  statusCode = 400;
  code = 'INVALID_QR' as const;
  constructor(message = 'Invalid QR token') {
    super(message);
    this.name = 'InvalidQrError';
  }
}

function decodeQrToken(qrToken: string): string {
  try {
    const payload = jwt.verify(qrToken, env.QR_JWT_SECRET) as JwtPayload & {
      tid: string;
    };

    if (!payload.tid) {
      throw new InvalidQrError('QR token missing ticket id');
    }

    return payload.tid;
  } catch (error) {
    if (error instanceof InvalidQrError) throw error;
    throw new InvalidQrError('Invalid or expired QR token');
  }
}

export async function scanTicket(qrToken: string): Promise<TicketSummary> {
  const ticketId = decodeQrToken(qrToken);

  const ticket = await checkinRepo.findTicketForScan(ticketId);

  if (!ticket) {
    logger.warn(`Checkin scan: ticket not found: ticketId=${ticketId}`);
    throw new NotFoundError('Ticket not found');
  }

  ticket.allowedActions = getAllowedActions(ticket.status);

  logger.info(`Checkin scan: ticketId=${ticketId} status=${ticket.status}`);
  return ticket;
}

export async function confirmEntryDirect(
  ticketId: string,
  checkerId: string,
): Promise<void> {
  const ok = await checkinRepo.confirmEntryDirect(ticketId, checkerId);

  if (!ok) {
    logger.warn(
      `Checkin confirm-entry: ticket not available: ticketId=${ticketId} checkerId=${checkerId}`,
    );
    throw new ConflictError('Ticket not available for direct entry');
  }

  logger.info(
    `Checkin confirm-entry: ticketId=${ticketId} checkerId=${checkerId}`,
  );
}
