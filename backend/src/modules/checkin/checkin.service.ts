import jwt, { type JwtPayload } from 'jsonwebtoken';

import { env } from '../../shared/config/env.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';
import { logger } from '../../utils/logger.js';

import * as checkinRepo from './checkin.repository.js';
import { messagingClient, type MessagingChannel } from '../messaging/index.js';
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

function signConfirmationToken(ticketId: string): string {
  return jwt.sign(
    { tid: ticketId, purpose: 'confirm' },
    env.CONFIRMATION_JWT_SECRET,
    { expiresIn: env.CONFIRMATION_TOKEN_TTL as jwt.SignOptions['expiresIn'] },
  );
}

function pickBuyerContact(
  email: string | null,
  phone: string | null,
): { channel: MessagingChannel; contact: string } | null {
  if (email) return { channel: 'email', contact: email };
  if (phone) return { channel: 'whatsapp', contact: phone };
  return null;
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

export async function requestConfirmation(
  ticketId: string,
  checkerId: string,
): Promise<void> {
  const result = await checkinRepo.requestConfirmation(ticketId);

  if (!result.ok) {
    if (result.reason === 'not_found') {
      logger.warn(
        `Checkin request-confirmation: ticket not found: ticketId=${ticketId} checkerId=${checkerId}`,
      );
      throw new NotFoundError('Ticket not found');
    }

    logger.warn(
      `Checkin request-confirmation: ticket not available: ticketId=${ticketId} checkerId=${checkerId}`,
    );
    throw new ConflictError('Ticket not available for confirmation request');
  }

  const buyer = pickBuyerContact(result.buyer.email, result.buyer.phone);

  if (!buyer) {
    logger.warn(
      `Checkin request-confirmation: buyer has no contact: ticketId=${ticketId}`,
    );
    return;
  }

  const token = signConfirmationToken(ticketId);
  const confirmationUrl = `${env.CONFIRMATION_LINK_BASE_URL}/confirmaciones?token=${token}`;

  await messagingClient.sendConfirmationLink({
    ticketId,
    buyerName: result.buyer.fullName,
    channel: buyer.channel,
    buyerContact: buyer.contact,
    confirmationUrl,
  });

  logger.info(
    `Checkin request-confirmation: ticketId=${ticketId} checkerId=${checkerId}`,
  );
}

export async function allowEntry(
  ticketId: string,
  checkerId: string,
): Promise<void> {
  const ok = await checkinRepo.allowEntry(ticketId, checkerId);

  if (!ok) {
    logger.warn(
      `Checkin allow-entry: ticket not available: ticketId=${ticketId} checkerId=${checkerId}`,
    );
    throw new ConflictError('Ticket not available for allow entry');
  }

  logger.info(
    `Checkin allow-entry: ticketId=${ticketId} checkerId=${checkerId}`,
  );
}
