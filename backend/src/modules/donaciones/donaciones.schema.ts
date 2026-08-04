import { z } from 'zod';
import { DonationAccount, DonationStatus } from '@prisma/client';

export const createDonationSchema = z.object({
  fullName: z.string().max(150).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  amountCents: z.number().int().min(5000, 'El monto mínimo es 5000 COP'),
  account: z.nativeEnum(DonationAccount),
  backUrl: z.string().url(),
  provider: z.enum(['epayco']).default('epayco'),
});

export const donationResponseSchema = z.object({
  initPoint: z.string(),
  sessionId: z.string().optional(),
});

export const donationStatusSchema = z.object({
  state: z.nativeEnum(DonationStatus),
  account: z.nativeEnum(DonationAccount),
  amountCents: z.number().int(),
  createdAt: z.string().datetime(),
});

export const webhookPayloadSchema = z.record(z.string(), z.unknown());

export type CreateDonationInput = z.infer<typeof createDonationSchema>;
export type DonationResponse = z.infer<typeof donationResponseSchema>;
export type DonationStatusResponse = z.infer<typeof donationStatusSchema>;

export type DonationProviderName = 'epayco-la-convencion' | 'epayco-barranqueros-utp';

export const adminListDonationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  state: z.nativeEnum(DonationStatus).optional(),
  account: z.nativeEnum(DonationAccount).optional(),
  search: z.string().max(255).optional(),
});

export type AdminListDonationsQuery = z.infer<typeof adminListDonationsQuerySchema>;
