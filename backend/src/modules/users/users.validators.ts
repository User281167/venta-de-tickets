import { z } from 'zod';

export const updateUserSchema = z
  .object({
    fullName: z.string().min(1).max(150).optional(),
    phone: z.string().min(10).max(20).optional().nullable(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
