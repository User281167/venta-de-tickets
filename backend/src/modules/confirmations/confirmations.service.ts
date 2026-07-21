import * as checkinRepo from '../checkin/checkin.repository.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';
import { logger } from '../../utils/logger.js';
import type { ConfirmationResult } from './confirmations.types.js';

export async function confirm(ticketId: string): Promise<ConfirmationResult> {
  const ok = await checkinRepo.confirmTicket(ticketId);

  if (!ok) {
    logger.warn(`Confirmations confirm: ticket not available: ticketId=${ticketId}`);
    throw new ConflictError('Ticket is no longer pending confirmation');
  }

  logger.info(`Confirmations confirm: ticketId=${ticketId}`);
  return 'confirmed';
}

export async function reject(ticketId: string): Promise<ConfirmationResult> {
  const ok = await checkinRepo.rejectConfirmation(ticketId);

  if (!ok) {
    logger.warn(`Confirmations reject: ticket not available: ticketId=${ticketId}`);
    throw new ConflictError('Ticket is no longer pending confirmation');
  }

  logger.info(`Confirmations reject: ticketId=${ticketId}`);
  return 'rejected';
}
