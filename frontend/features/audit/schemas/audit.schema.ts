import { z } from "zod";
import { AUDIT_ENTITY_TYPES } from "../types";

export const auditLogFiltersSchema = z.object({
  entityType: z.enum(AUDIT_ENTITY_TYPES as unknown as [string, ...string[]]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type AuditLogFiltersInput = z.infer<typeof auditLogFiltersSchema>;
