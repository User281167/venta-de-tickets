import { z } from 'zod';
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from './tickets.config.js';

export const ticketTypeStatusSchema = z.enum(['enabled', 'disabled', 'blocked']);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
});

export const paramsSchema = z.object({
  id: z.string().uuid(),
});

export const createTicketSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  quantityTotal: z
    .number()
    .int()
    .positive('Quantity total must be greater than 0'),
  maxPerUser: z.number().int().positive('Max per user must be greater than 0').optional(),
  saleEndsAt: z.string().datetime().optional(),
}).strict();

export const updateTicketSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  description: z.string().nullable().optional(),
  price: z.number().positive('Price must be greater than 0').optional(),
  quantityTotal: z.number().int().positive('Quantity total must be greater than 0').optional(),
  maxPerUser: z.number().int().positive('Max per user must be greater than 0').nullable().optional(),
  saleEndsAt: z.string().datetime().nullable().optional(),
  status: ticketTypeStatusSchema.optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});
