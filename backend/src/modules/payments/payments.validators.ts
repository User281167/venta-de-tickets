import { z } from 'zod';

export const checkoutItemSchema = z.object({
  ticketTypeId: z.string().uuid('Invalid ticket type ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, 'At least one item is required'),
  backUrl: z.string().url('Invalid back URL'),
  provider: z.enum(['mercadopago', 'epayco'], {
    errorMap: () => ({ message: 'Payment provider must be "mercadopago" or "epayco"' }),
  }),
}).strict();

export const paymentStatusParamsSchema = z.object({
  id: z.string().uuid('Invalid payment ID'),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
