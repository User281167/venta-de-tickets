import { z } from "zod";

const cedulaSchema = z
  .string()
  .min(5, "Cédula debe tener al menos 5 dígitos")
  .max(20, "Cédula debe tener máximo 20 dígitos")
  .regex(/^\d+$/, "Cédula debe contener solo números");

const phoneSchema = z.preprocess(
  (v) => (v === "" ? null : v),
  z.string().min(10).max(20).optional().nullable(),
);

const dateOfBirthSchema = z.preprocess(
  (v) => (v === "" || v === null ? null : v),
  z.string().nullable().optional(),
);

export const updateUserSchema = z
  .object({
    cedula: cedulaSchema.optional(),
    fullName: z.string().min(1).max(150).optional(),
    phone: phoneSchema,
    address: z.string().optional().nullable(),
    dateOfBirth: dateOfBirthSchema,
  })
  .strict();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
