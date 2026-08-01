export type AuditEntityType =
  | "Tipo de entrada"
  | "Entrada"
  | "Pagos"
  | "Usuarios";

export interface AuditLogEntry {
  id: string;
  eventId: string;
  actorId: string;
  actorRole: string;
  actorName: string | null;
  actorCedula: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogResponse {
  data: AuditLogEntry[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const AUDIT_ENTITY_TYPES: readonly AuditEntityType[] = [
  "Tipo de entrada",
  "Entrada",
  "Pagos",
  "Usuarios",
] as const;

export interface AuditLogFilters {
  entityType?: AuditEntityType;
  limit: number;
}
