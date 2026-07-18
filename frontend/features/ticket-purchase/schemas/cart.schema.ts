import { z } from "zod";

export const cartItemSchema = z.object({
  ticketTypeId: z.string().uuid(),
  name: z.string(),
  unitPriceCents: z.number().positive(),
  quantity: z.number().int().min(1),
  maxPerUser: z.number().int().positive().nullable(),
  availableStock: z.number().int().min(0),
  status: z.enum(['enabled', 'disabled', 'blocked']),
});

export const cartStateSchema = z.object({
  items: z.array(cartItemSchema),
  eventId: z.string().uuid().nullable(),
  updatedAt: z.number(),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type CartState = z.infer<typeof cartStateSchema>;
