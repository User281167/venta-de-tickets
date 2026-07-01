import { z } from 'zod';

export const eventIdParamSchema = z.object({
  eventId: z.string().uuid(),
});

export const createTicketTypeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  quantityTotal: z.number().int().positive(),
  maxPerUser: z.number().int().min(1).optional(),
  saleEndsAt: z.string().datetime().optional(),
});

export const updateTicketTypeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  quantityTotal: z.number().int().positive().optional(),
  maxPerUser: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  saleEndsAt: z.string().datetime().optional().nullable(),
});
