import jwt from 'jsonwebtoken';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ValidationError } from '../../shared/errors/ValidationError.js';
import { env } from '../../shared/config/env.js';
import * as ticketsRepo from './tickets.repository.js';

import { logger } from '../../utils/logger.js';

export async function listTicketTypes(page: number, limit: number) {
  const [data, total] = await Promise.all([
    ticketsRepo.findAllPublic(page, limit),
    ticketsRepo.countPublic(),
  ]);

  return { data, total, page, limit };
}

export async function getTicketTypeById(id: string) {
  logger.info(`Getting ticket type: id=${id}`);
  const ticketType = await ticketsRepo.findById(id);

  if (!ticketType) {
    logger.warn(`Ticket type not found: id=${id}`);
    throw new NotFoundError('Ticket type not found');
  }

  return ticketType;
}

export async function listAllTicketTypes(page: number, limit: number) {
  const [data, total] = await Promise.all([
    ticketsRepo.findAllAdmin(page, limit),
    ticketsRepo.countAll(),
  ]);

  return { data, total, page, limit };
}

export async function createTicketType(data: {
  name: string;
  description?: string;
  price: number;
  quantityTotal: number;
  maxPerUser?: number;
  saleEndsAt?: string;
}) {
  logger.info(`Creating ticket type: name=${data.name}`);
  const ticketType = await ticketsRepo.create({
    name: data.name,
    description: data.description,
    price: data.price,
    quantityTotal: data.quantityTotal,
    maxPerUser: data.maxPerUser,
    saleEndsAt: data.saleEndsAt ? new Date(data.saleEndsAt) : undefined,
  });

  logger.info(`Ticket type created: id=${ticketType.id}`);
  return ticketType;
}

export async function updateTicketType(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    price?: number;
    quantityTotal?: number;
    maxPerUser?: number | null;
    saleEndsAt?: string | null;
    status?: 'enabled' | 'disabled' | 'blocked';
  },
) {
  logger.info(`Updating ticket type: id=${id}`);
  const existing = await ticketsRepo.findById(id);

  if (!existing) {
    logger.warn(`Ticket type not found: id=${id}`);
    throw new NotFoundError('Ticket type not found');
  }

  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.maxPerUser !== undefined) updateData.maxPerUser = data.maxPerUser;
  if (data.saleEndsAt !== undefined) {
    updateData.saleEndsAt = data.saleEndsAt ? new Date(data.saleEndsAt) : null;
  }
  if (data.status !== undefined) updateData.status = data.status;

  if (data.quantityTotal !== undefined) {
    if (data.quantityTotal < existing.quantitySold) {
      logger.warn(
        `quantityTotal: Cannot be lower than current sold tickets (${existing.quantitySold})`,
      );

      throw new ValidationError(
        'VALIDATION_ERROR',
        `quantityTotal: Cannot be lower than current sold tickets (${existing.quantitySold})`,
      );
    }

    updateData.quantityTotal = data.quantityTotal;
  }

  logger.info(`Ticket type updated: id=${id}`);

  return ticketsRepo.update(id, updateData);
}

export async function generateQrForTicket(ticketId: string) {
  logger.info(`Generating QR for ticket: ticketId=${ticketId}`);

  const token = jwt.sign(
    { tid: ticketId, iat: Math.floor(Date.now() / 1000) },
    env.QR_JWT_SECRET,
  );

  await ticketsRepo.updateQrToken(ticketId, token);
  logger.info(`QR generated for ticket: ticketId=${ticketId}`);
  return token;
}

export async function listMyTickets(
  userId: string,
  page: number,
  limit: number,
) {
  const [data, total] = await Promise.all([
    ticketsRepo.findByUserId(userId, page, limit),
    ticketsRepo.countByUserId(userId),
  ]);

  logger.info(`Tickets listed: total=${total} page=${page} limit=${limit}`);
  return { data, total, page, limit };
}

export async function getMyTicketById(ticketId: string, userId: string) {
  logger.info(`Getting ticket: ticketId=${ticketId} userId=${userId}`);
  const ticket = await ticketsRepo.findOwnedById(ticketId, userId);

  if (!ticket) {
    logger.warn(`Ticket not found: ticketId=${ticketId} userId=${userId}`);
    throw new NotFoundError('Ticket not found');
  }

  return ticket;
}
