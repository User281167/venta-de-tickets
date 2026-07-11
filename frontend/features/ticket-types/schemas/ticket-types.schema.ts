import { z } from "zod";

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
});

export const eventWithTicketTypesSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  eventDate: z.string(),
  doorsOpenAt: z.string().nullable(),
  saleEndsAt: z.string().nullable(),
  location: z.string().nullable(),
  status: z.string(),
  ticketTypes: z.array(ticketTypeSchema),
});

export const adminTicketTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  quantityTotal: z.number(),
  quantitySold: z.number(),
  maxPerUser: z.number().nullable(),
  isActive: z.boolean(),
  saleEndsAt: z.string().nullable(),
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
});

export const updateTicketTypeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  quantityTotal: z.number().int().positive().optional(),
  maxPerUser: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  saleEndsAt: z.string().optional().nullable(),
});

export type TicketType = z.infer<typeof ticketTypeSchema>;
export type EventWithTicketTypes = z.infer<typeof eventWithTicketTypesSchema>;
export type AdminTicketType = z.infer<typeof adminTicketTypeSchema>;
export type CreateTicketTypeInput = z.infer<typeof createTicketTypeSchema>;
export type UpdateTicketTypeInput = z.infer<typeof updateTicketTypeSchema>;
