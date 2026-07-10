import { z } from "zod";

export const paymentStatusSchema = z.enum(["pending", "completed", "failed", "refunded"]);

export const ticketSummarySchema = z.object({
  id: z.string(),
  ticketCode: z.string(),
  status: z.string(),
});

export const paymentItemSchema = z.object({
  id: z.string(),
  provider: z.string(),
  amountCents: z.number().int().nonnegative(),
  status: paymentStatusSchema,
  createdAt: z.string(),
  tickets: z.array(ticketSummarySchema),
});

export const paymentListResponseSchema = z.object({
  data: z.array(paymentItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
