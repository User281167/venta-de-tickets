import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/prisma.client.js';
import type { AuditLogInput, AuditLogEntry } from './audit.types.js';

export const auditRepository = {
  create: async (input: AuditLogInput): Promise<AuditLogEntry> => {
    return prisma.auditLog.create({
      data: {
        eventId: input.eventId,
        actorId: input.actorId,
        actorRole: input.actorRole,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata ?? Prisma.JsonNull,
      },
    });
  },

  findMany: async (params: {
    since?: Date;
    entityType?: string;
    limit: number;
  }): Promise<AuditLogEntry[]> => {
    const where: Prisma.AuditLogWhereInput = {};

    if (params.since) {
      where.createdAt = { gt: params.since };
    }

    if (params.entityType) {
      where.entityType = params.entityType;
    }

    return prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: params.limit + 1,
    });
  },
};
