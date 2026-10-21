import { z } from 'zod';

export const cedulaSchema = z
  .string()
  .min(8, 'Cedula must be at least 8 digits')
  .max(15, 'Cedula must be at most 15 digits')
  .regex(/^\d+$/, 'Cedula must contain only numbers');

const phoneSchema = z
  .string()
  .trim()
  .min(7)
  .max(20)
  .regex(/^\+?[\d\s()-]+$/)
  .transform((value) => value.replace(/[\s()-]/g, ''));

export const registerInput = z.object({
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(255),
  phone: phoneSchema,
  cedula: cedulaSchema,
  profesion: z.string().trim().min(1).max(100),
});

export const confirmRegisterInput = z.object({ confirmed: z.boolean() });

export type RegisterInput = z.infer<typeof registerInput>;
