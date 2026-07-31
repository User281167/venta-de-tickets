import type { Prisma } from '@prisma/client';

export interface AuditLogInput {
  eventId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}

export type AuditLogEntry = {
  id: string;
  eventId: string;
  actorId: string;
  actorRole: string;
  actorName: string | null;
  actorCedula: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
};

export interface ListAuditLogInput {
  since?: Date;
  cursor?: { createdAt: Date; id: string } | null;
  entityType?: string;
  limit: number;
}

export interface ListAuditLogResult {
  data: AuditLogEntry[];
  nextCursor: string | null;
  hasMore: boolean;
}
