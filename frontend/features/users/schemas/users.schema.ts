import { z } from "zod";

const cedulaSchema = z
  .string()
  .min(8, 'Cédula debe tener al menos 8 dígitos')
  .max(15, 'Cédula debe tener máximo 15 dígitos')
  .regex(/^\d+$/, 'Cédula debe contener solo números');

const phoneSchema = z.preprocess(
  (v) => (v === '' ? null : v),
  z.string().min(10).max(20).optional().nullable(),
);

const dateOfBirthSchema = z.preprocess(
  (v) => (v === '' || v === null ? null : v),
  z.string().nullable().optional(),
);

export const updateUserSchema = z.object({
  cedula: cedulaSchema.optional(),
  fullName: z.string().min(1).max(150).optional(),
  phone: phoneSchema,
  address: z.string().optional().nullable(),
  dateOfBirth: dateOfBirthSchema,
}).strict();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
