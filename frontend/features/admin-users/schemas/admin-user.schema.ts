import { z } from "zod";

const phoneSchema = z.preprocess(
  (v) => (v === "" ? null : v),
  z.string().min(10).max(20).optional().nullable(),
);

export const adminUserUpdateSchema = z
  .object({
    fullName: z.string().min(1, "Nombre es requerido").max(150).optional(),
    phone: phoneSchema,
    cedula: z
      .string()
      .min(8, "Mínimo 8 dígitos")
      .max(15, "Máximo 15 dígitos")
      .regex(/^\d+$/, "Solo números permitidos")
      .optional(),
    role: z.enum(["admin", "checker", "client"]).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Al menos un campo debe ser modificado",
  });

export const adminUserCreateSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  fullName: z.string().min(1, "Nombre es requerido").max(150),
  cedula: z
    .string()
    .min(8, "Mínimo 8 dígitos")
    .max(15, "Máximo 15 dígitos")
    .regex(/^\d+$/, "Solo números permitidos")
    .optional(),
  phone: phoneSchema,
}).strict();

export const excelRowSchema = z.object({
  fullName: z.string().min(1).max(150),
  cedula: z.string().min(8).max(15).regex(/^\d+$/).optional(),
  phone: z.string().min(10).max(20).optional(),
  email: z.string().email(),
  password: z.string().min(6),
});

export type ParsedExcelRow = z.infer<typeof excelRowSchema>;
