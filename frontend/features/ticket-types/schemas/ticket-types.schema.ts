import { z } from "zod";

export const ticketTypeZonaSchema = z.enum(["vip", "plata", "bronce"]);
export type TicketTypeZona = z.infer<typeof ticketTypeZonaSchema>;

export const ticketTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  availableCount: z.number(),
  maxPerUser: z.number().nullable(),
  saleEndsAt: z.string().nullable(),
  isSoldOut: z.boolean(),
  isActive: z.boolean(),
  onlyEgresados: z.boolean(),
  zona: ticketTypeZonaSchema.nullable(),
  status: z.enum(['enabled', 'disabled', 'blocked']),
});

export const adminTicketTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  quantityTotal: z.number(),
  quantitySold: z.number(),
  maxPerUser: z.number().nullable(),
  status: z.enum(['enabled', 'disabled', 'blocked']),
  isActive: z.boolean(),
  saleEndsAt: z.string().nullable(),
  onlyEgresados: z.boolean(),
  zona: ticketTypeZonaSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createTicketTypeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  quantityTotal: z.number().int().positive(),
  maxPerUser: z.number().int().min(1).optional(),
  saleEndsAt: z.string().optional(),
  onlyEgresados: z.boolean().optional(),
  zona: ticketTypeZonaSchema.nullable().optional(),
});

export const updateTicketTypeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  quantityTotal: z.number().int().positive().optional(),
  maxPerUser: z.number().int().min(1).optional(),
  status: z.enum(['enabled', 'disabled', 'blocked']).optional(),
  saleEndsAt: z.string().optional().nullable(),
  onlyEgresados: z.boolean().optional(),
  zona: ticketTypeZonaSchema.nullable().optional(),
});

export type TicketType = z.infer<typeof ticketTypeSchema>;
export type AdminTicketType = z.infer<typeof adminTicketTypeSchema>;
export type CreateTicketTypeInput = z.infer<typeof createTicketTypeSchema>;
export type UpdateTicketTypeInput = z.infer<typeof updateTicketTypeSchema>;
