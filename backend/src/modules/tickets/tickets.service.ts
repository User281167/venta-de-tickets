import jwt from 'jsonwebtoken';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ValidationError } from '../../shared/errors/ValidationError.js';
import { env } from '../../shared/config/env.js';
import * as ticketsRepo from './tickets.repository.js';
import * as auditService from '../audit/audit.service.js';
import {
  EVENT_ID,
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from '../audit/audit.constants.js';

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

  if (ticketType.status === 'blocked') {
    logger.warn(`Ticket type blocked: id=${id}`);
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

export async function createTicketType(
  data: {
    name: string;
    description?: string;
    priceCents: number;
    quantityTotal: number;
    maxPerUser?: number;
    saleEndsAt?: string;
    onlyEgresados?: boolean;
    zona?: string | null;
  },
  actor: { id: string },
) {
  logger.info(`Creating ticket type: name=${data.name}`);
  const ticketType = await ticketsRepo.create({
    name: data.name,
    description: data.description,
    priceCents: data.priceCents,
    quantityTotal: data.quantityTotal,
    maxPerUser: data.maxPerUser,
    saleEndsAt: data.saleEndsAt ? new Date(data.saleEndsAt) : undefined,
    onlyEgresados: data.onlyEgresados,
    zona: data.zona ?? null,
  });

  await auditService.log({
    eventId: EVENT_ID,
    actorId: actor.id,
    action: AUDIT_ACTIONS.TICKET_TYPE_CREADO,
    entityType: AUDIT_ENTITY_TYPES.TIPO_ENTRADA,
    entityId: ticketType.id,
    metadata: {
      nombre: data.name,
      precio: data.priceCents,
      'Cantidad Total': data.quantityTotal,
      zona: data.zona ?? null,
    },
  });

  logger.info(`Ticket type created: id=${ticketType.id}`);
  return ticketType;
}

export async function updateTicketType(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    priceCents?: number;
    quantityTotal?: number;
    maxPerUser?: number | null;
    saleEndsAt?: string | null;
    status?: 'enabled' | 'disabled' | 'blocked';
    onlyEgresados?: boolean;
    zona?: string | null;
  },
  actor: { id: string },
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
  if (data.priceCents !== undefined) updateData.priceCents = data.priceCents;
  if (data.maxPerUser !== undefined) updateData.maxPerUser = data.maxPerUser;
  if (data.saleEndsAt !== undefined) {
    updateData.saleEndsAt = data.saleEndsAt ? new Date(data.saleEndsAt) : null;
  }
  if (data.status !== undefined) updateData.status = data.status;
  if (data.onlyEgresados !== undefined)
    updateData.onlyEgresados = data.onlyEgresados;
  if (data.zona !== undefined) updateData.zona = data.zona;

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

  const updated = await ticketsRepo.update(id, updateData);

  if (data.priceCents !== undefined && Number(existing.priceCents) !== data.priceCents) {
    await auditService.log({
      eventId: EVENT_ID,
      actorId: actor.id,
      action: AUDIT_ACTIONS.TICKET_TYPE_PRECIO_ACTUALIZADO,
      entityType: AUDIT_ENTITY_TYPES.TIPO_ENTRADA,
      entityId: id,
      metadata: {
        'Precio Anterior': Number(existing.priceCents),
        'Precio Nuevo': data.priceCents,
      },
    });
  }

  if (data.status !== undefined && existing.status !== data.status) {
    await auditService.log({
      eventId: EVENT_ID,
      actorId: actor.id,
      action: AUDIT_ACTIONS.TICKET_TYPE_ESTADO_ACTUALIZADO,
      entityType: AUDIT_ENTITY_TYPES.TIPO_ENTRADA,
      entityId: id,
      metadata: {
        'Estado Anterior': existing.status,
        'Estado Nuevo': data.status,
      },
    });
  }

  if (data.name !== undefined && existing.name !== data.name) {
    await auditService.log({
      eventId: EVENT_ID,
      actorId: actor.id,
      action: AUDIT_ACTIONS.TICKET_TYPE_NOMBRE_ACTUALIZADO,
      entityType: AUDIT_ENTITY_TYPES.TIPO_ENTRADA,
      entityId: id,
      metadata: { 'Nombre Anterior': existing.name, 'Nombre Nuevo': data.name },
    });
  }

  if (
    data.description !== undefined &&
    (existing.description ?? null) !== (data.description ?? null)
  ) {
    await auditService.log({
      eventId: EVENT_ID,
      actorId: actor.id,
      action: AUDIT_ACTIONS.TICKET_TYPE_DESCRIPCION_ACTUALIZADA,
      entityType: AUDIT_ENTITY_TYPES.TIPO_ENTRADA,
      entityId: id,
      metadata: {
        'Descripción Anterior': existing.description,
        'Descripción Nueva': data.description,
      },
    });
  }

  if (
    data.quantityTotal !== undefined &&
    existing.quantityTotal !== data.quantityTotal
  ) {
    await auditService.log({
      eventId: EVENT_ID,
      actorId: actor.id,
      action: AUDIT_ACTIONS.TICKET_TYPE_CANTIDAD_TOTAL_ACTUALIZADA,
      entityType: AUDIT_ENTITY_TYPES.TIPO_ENTRADA,
      entityId: id,
      metadata: {
        'Cantidad Total Anterior': existing.quantityTotal,
        'Cantidad Total Nueva': data.quantityTotal,
      },
    });
  }

  if (
    data.maxPerUser !== undefined &&
    (existing.maxPerUser ?? null) !== (data.maxPerUser ?? null)
  ) {
    await auditService.log({
      eventId: EVENT_ID,
      actorId: actor.id,
      action: AUDIT_ACTIONS.TICKET_TYPE_MAXIMO_POR_USUARIO_ACTUALIZADO,
      entityType: AUDIT_ENTITY_TYPES.TIPO_ENTRADA,
      entityId: id,
      metadata: {
        'Máximo Por Usuario Anterior': existing.maxPerUser,
        'Máximo Por Usuario Nuevo': data.maxPerUser,
      },
    });
  }

  if (data.saleEndsAt !== undefined) {
    const beforeIso = existing.saleEndsAt
      ? existing.saleEndsAt.toISOString()
      : null;
    const afterIso = data.saleEndsAt
      ? new Date(data.saleEndsAt).toISOString()
      : null;
    if (beforeIso !== afterIso) {
      await auditService.log({
        eventId: EVENT_ID,
        actorId: actor.id,
        action: AUDIT_ACTIONS.TICKET_TYPE_VENTANA_VENTA_ACTUALIZADA,
        entityType: AUDIT_ENTITY_TYPES.TIPO_ENTRADA,
        entityId: id,
        metadata: {
          'Fin Venta Anterior': beforeIso,
          'Fin Venta Nuevo': afterIso,
        },
      });
    }
  }

  if (
    data.onlyEgresados !== undefined &&
    existing.onlyEgresados !== data.onlyEgresados
  ) {
    await auditService.log({
      eventId: EVENT_ID,
      actorId: actor.id,
      action: AUDIT_ACTIONS.TICKET_TYPE_FLAG_EGRESADO_ACTUALIZADO,
      entityType: AUDIT_ENTITY_TYPES.TIPO_ENTRADA,
      entityId: id,
      metadata: {
        'Flag Egresado Anterior': existing.onlyEgresados,
        'Flag Egresado Nuevo': data.onlyEgresados,
      },
    });
  }

  if (data.zona !== undefined && (existing.zona ?? null) !== (data.zona ?? null)) {
    await auditService.log({
      eventId: EVENT_ID,
      actorId: actor.id,
      action: AUDIT_ACTIONS.TICKET_TYPE_ZONA_ACTUALIZADA,
      entityType: AUDIT_ENTITY_TYPES.TIPO_ENTRADA,
      entityId: id,
      metadata: {
        'Entrada': data.name,
        'Zona Anterior': existing.zona ?? null,
        'Zona Nueva': data.zona ?? null,
      },
    });
  }

  logger.info(`Ticket type updated: id=${id}`);

  return updated;
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
