import { z } from 'zod';

export const scanSchema = z
  .object({
    qrToken: z.string().min(1, 'QR token is required'),
  })
  .strict();

export const ticketActionSchema = z
  .object({
    ticketId: z.string().uuid('ticketId must be a valid UUID'),
  })
  .strict();
