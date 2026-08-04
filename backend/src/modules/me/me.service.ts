import { ValidationError } from '../../shared/errors/ValidationError.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';
import * as checkinRepo from '../checkin/checkin.repository.js';
import * as meRepo from './me.repository.js';
import * as ticketsService from '../tickets/tickets.service.js';
import { logger } from '../../utils/logger.js';

export type ConfirmationResult = 'confirmed' | 'rejected';

async function findOwnedTicket(ticketId: string, userId: string) {
  const ticket = await ticketsService.getMyTicketById(ticketId, userId);

  if (ticket.status !== 'pending_confirmation') {
    throw new ConflictError('Ticket is no longer pending confirmation');
  }

  return ticket;
}

export async function confirmMyTicket(
  ticketId: string,
  userId: string,
): Promise<ConfirmationResult> {
  await findOwnedTicket(ticketId, userId);

  const ok = await checkinRepo.confirmTicket(ticketId);

  if (!ok) {
    logger.warn(
      `Me confirm: ticket not available: ticketId=${ticketId} userId=${userId}`,
    );
    throw new ConflictError('Ticket is no longer pending confirmation');
  }

  logger.info(`Me confirm: ticketId=${ticketId} userId=${userId}`);
  return 'confirmed';
}

export async function rejectMyTicket(
  ticketId: string,
  userId: string,
): Promise<ConfirmationResult> {
  await findOwnedTicket(ticketId, userId);

  const ok = await checkinRepo.rejectConfirmation(ticketId);

  if (!ok) {
    logger.warn(
      `Me reject: ticket not available: ticketId=${ticketId} userId=${userId}`,
    );
    throw new ConflictError('Ticket is no longer pending confirmation');
  }

  logger.info(`Me reject: ticketId=${ticketId} userId=${userId}`);
  return 'rejected';
}

export async function getPersonalInfo(userId: string) {
  const user = await meRepo.findByUserId(userId);

  if (!user) {
    logger.error(`User not found: userId=${userId}`);

    return {
      cedula: null,
      fullName: null,
      phone: null,
      address: null,
      dateOfBirth: null,
      egresado: false,
    };
  }

  return {
    cedula: user.cedula ?? null,
    fullName: user.fullName,
    phone: user.phone ?? null,
    address: user.address ?? null,
    dateOfBirth: user.dateOfBirth
      ? user.dateOfBirth.toISOString().split('T')[0]
      : null,
    egresado: user.egresado ?? false,
  };
}

export async function setPersonalInfo(
  userId: string,
  data: Record<string, unknown>,
) {
  logger.info(`Setting personal info for user: userId=${userId}`);

  const existing = await meRepo.findByUserId(userId);
  const updateData: Record<string, unknown> = {};

  if (data.fullName !== undefined) updateData.fullName = data.fullName;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.dateOfBirth !== undefined) {
    updateData.dateOfBirth = data.dateOfBirth
      ? new Date(data.dateOfBirth as string)
      : null;
  }

  if (data.cedula !== undefined) {
    if (existing?.cedula && data.cedula !== existing.cedula) {
      logger.warn(
        `Cedula invalidation attempt: userId=${userId}, existingCedula=${existing.cedula}, newCedula=${data.cedula}`,
      );

      throw new ValidationError(
        'CEDULA_INVALIDATION',
        'Cedula already set and cannot be modified',
      );
    }

    if (data.cedula && data.cedula !== existing?.cedula) {
      const owner = await meRepo.findOwnerByCedula(data.cedula as string);

      if (owner && owner.id !== userId) {
        throw new ConflictError('La cédula ya está registrada por otro usuario');
      }
    }

    updateData.cedula = data.cedula;
  }

  const user = await meRepo.upsert(userId, updateData);

  logger.info(
    `User updated: userId=${userId}, updateData=${JSON.stringify(updateData)}`,
  );

  return {
    cedula: user.cedula ?? null,
    fullName: user.fullName,
    phone: user.phone ?? null,
    address: user.address ?? null,
    dateOfBirth: user.dateOfBirth
      ? user.dateOfBirth.toISOString().split('T')[0]
      : null,
  };
}
