import { z } from 'zod';

const cedulaSchema = z
  .string()
  .min(5, 'Cedula must be at least 5 digits')
  .max(20, 'Cedula must be at most 20 digits')
  .regex(/^\d+$/, 'Cedula must contain only numbers');

const phoneSchema = z.preprocess(
  (v) => (v === '' ? null : v),
  z.string().min(10).max(20).optional().nullable(),
);

const dateOfBirthSchema = z.preprocess(
  (v) => (v === '' || v === null ? null : v),
  z.string().nullable().optional(),
);

export const setPersonalInfoSchema = z
  .object({
    cedula: cedulaSchema,
    fullName: z.string().min(1).max(150),
    phone: phoneSchema,
    address: z.string().optional().nullable(),
    dateOfBirth: dateOfBirthSchema,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const updatePersonalInfoSchema = z
  .object({
    cedula: cedulaSchema.optional(),
    fullName: z.string().min(1).max(150).optional(),
    phone: phoneSchema,
    address: z.string().optional().nullable(),
    dateOfBirth: dateOfBirthSchema,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type SetPersonalInfoInput = z.infer<typeof setPersonalInfoSchema>;
export type UpdatePersonalInfoInput = z.infer<typeof updatePersonalInfoSchema>;

export const personalInfoSelect = {
  cedula: true,
  fullName: true,
  phone: true,
  address: true,
  dateOfBirth: true,
  egresado: true,
} as const;
