import { z } from 'zod';

const cedulaSchema = z
  .string()
  .min(8, 'Cedula must be at least 8 digits')
  .max(15, 'Cedula must be at most 15 digits')
  .regex(/^\d+$/, 'Cedula must contain only numbers');

const phoneSchema = z.preprocess(
  (v) => (v === '' ? null : v),
  z.string().min(10).max(20).optional().nullable(),
);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'checker', 'client']),
});

export const createUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(1).max(150),
    cedula: cedulaSchema.optional(),
    phone: phoneSchema,
  })
  .strict();

export const batchCreateUsersSchema = z
  .array(createUserSchema)
  .min(1, 'At least one user required')
  .max(50, 'Maximum 50 users per batch');

export const updateUserSchema = z
  .object({
    fullName: z.string().min(1).max(150).optional(),
    phone: phoneSchema,
    cedula: cedulaSchema.optional(),
    role: z.enum(['admin', 'checker', 'client']).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const paymentPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const paymentParamsSchema = z.object({
  id: z.string().uuid(),
});

export const paymentFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
});

export const refundSchema = z
  .object({
    reason: z
      .string()
      .min(10, 'Reason must be at least 10 characters')
      .max(500),
  })
  .strict();

export const createAdminPaymentSchema = z
  .object({
    userId: z.string().uuid(),
    provider: z.enum(['MANUAL', 'GIFT']),
    tickets: z
      .array(
        z.object({
          ticketTypeId: z.string().uuid(),
          quantity: z.number().int().min(1),
        }),
      )
      .min(1, 'At least one ticket type is required'),
  })
  .strict();
