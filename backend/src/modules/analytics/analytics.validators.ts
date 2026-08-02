import { z } from 'zod';

const isoDate = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), {
    message: 'must be a valid ISO 8601 date',
  })
  .transform((v) => new Date(v))
  .optional();

const dateRangeSchema = z
  .object({
    from: isoDate,
    to: isoDate,
  })
  .refine(
    (v) => !v.from || !v.to || v.from.getTime() <= v.to.getTime(),
    { message: 'from must be <= to' },
  );

export const dateRangeQuerySchema = dateRangeSchema;

export type DateRangeQuery = z.infer<typeof dateRangeQuerySchema>;

export const topDiscountCodesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type TopDiscountCodesQuery = z.infer<
  typeof topDiscountCodesQuerySchema
>;

export const donationsQuerySchema = dateRangeSchema.extend({
  state: z.enum(['pending', 'confirmed', 'rejected', 'cancelled']).optional(),
});

export type DonationsQuery = z.infer<typeof donationsQuerySchema>;

export const weeklyReportQuerySchema = z.object({
  week: z.string().regex(/^\d{4}-W\d{2}$/, 'week must match YYYY-Www'),
});

export type WeeklyReportQuery = z.infer<typeof weeklyReportQuerySchema>;
