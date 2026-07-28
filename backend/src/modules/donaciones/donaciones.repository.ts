import { Donation, DonationAccount, DonationStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/prisma.client.js';

export interface CreateDonationData {
  fullName?: string | null;
  email?: string | null;
  amountCents: number;
  account: DonationAccount;
  externalReference: string;
}

export interface UpdateDonationData {
  state?: DonationStatus;
  paymentId?: string | null;
  metadata?: Prisma.InputJsonValue;
}

export function createDonationUUID() {
  return crypto.randomUUID();
}

export const donationRepository = {
  create: async (data: CreateDonationData): Promise<Donation> => {
    return prisma.donation.create({
      data: {
        full_name: data.fullName,
        email: data.email,
        amountCents: data.amountCents,
        account: data.account,
        externalReference: data.externalReference,
      },
    });
  },

  findByExternalReference: async (
    externalReference: string,
  ): Promise<Donation | null> => {
    return prisma.donation.findUnique({
      where: { externalReference: externalReference },
    });
  },

  updateStateByExternalReference: async (
    externalReference: string,
    data: UpdateDonationData,
  ): Promise<number> => {
    const result = await prisma.donation.updateMany({
      where: {
        externalReference: externalReference,
        state: 'pending',
      },
      data: {
        state: data.state,
        paymentId: data.paymentId,
        metadata: data.metadata,
      },
    });
    return result.count;
  },
};
