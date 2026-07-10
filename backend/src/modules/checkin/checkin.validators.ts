import { z } from 'zod';

export const checkinSchema = z.object({
  qrToken: z.string().min(1, 'QR token is required'),
}).strict();
