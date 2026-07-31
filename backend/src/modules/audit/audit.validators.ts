import { z } from 'zod';

const isoDate = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), {
    message: 'since must be a valid ISO 8601 datetime',
  })
  .transform((v) => new Date(v))
  .optional();

export const listAuditLogQuerySchema = z.object({
  since: isoDate,
  cursor: z.string().optional(),
  entityType: z.string().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type ListAuditLogQuery = z.infer<typeof listAuditLogQuerySchema>;
