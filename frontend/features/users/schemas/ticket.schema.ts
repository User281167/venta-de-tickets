import { z } from "zod";

export const ticketStatusSchema = z.enum([
  "reserved",
  "paid",
  "pending_confirmation",
  "confirmed",
  "used",
  "cancelled",
  "expired",
]);

export const ticketTypeInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
});

export const ticketItemSchema = z.object({
  id: z.string(),
  ticketCode: z.string(),
  qrToken: z.string().nullable(),
  status: ticketStatusSchema,
  purchasedAt: z.string().nullable(),
  createdAt: z.string(),
  ticketType: ticketTypeInfoSchema,
});

export const ticketListResponseSchema = z.object({
  data: z.array(ticketItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
