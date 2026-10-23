import {
  Donation,
  DonationAccount,
  DonationCounter,
  DonationStatus,
} from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/prisma.client.js';
import { DONATION_COUNTER_ID } from './donaciones.types.js';

export interface CreateDonationData {
  fullName?: string | null;
  email?: string | null;
  company?: string | null;
  amountCents: number;
  account: DonationAccount;
  externalReference: string;
}

export interface UpdateDonationData {
  state?: DonationStatus;
  paymentId?: string | null;
  metadata?: Prisma.InputJsonValue;
}

export interface AdminDonationFilters {
  page: number;
  limit: number;
  state?: DonationStatus;
  account?: DonationAccount;
  search?: string;
}

export interface PaginatedDonations {
  data: Donation[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateCounterData {
  currentValue?: number;
  metaValue?: number;
  updatedBy: string;
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
        company: data.company,
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
  ): Promise<Donation | null> => {
    return prisma.$transaction(async (tx) => {
      const allowedStates =
        data.state === 'confirmed'
          ? (['pending', 'rejected'] as DonationStatus[])
          : (['pending'] as DonationStatus[]);
      const transition = await tx.donation.updateMany({
        where: {
          externalReference,
          state: { in: allowedStates },
        },
        data: {
          state: data.state,
          paymentId: data.paymentId,
          metadata: data.metadata,
        },
      });

      if (transition.count === 0) {
        return null;
      }

      const donation = await tx.donation.findUnique({
        where: { externalReference: externalReference },
      });

      if (!donation) {
        throw new Error('Donation missing after webhook state transition');
      }

      if (data.state === 'confirmed' && donation.amountCents > 0) {
        await tx.donationCounter.upsert({
          where: { id: DONATION_COUNTER_ID },
          update: { currentValue: { increment: donation.amountCents } },
          create: {
            id: DONATION_COUNTER_ID,
            currentValue: donation.amountCents,
          },
        });
      }

      return donation;
    });
  },

  findById: async (id: string): Promise<Donation | null> => {
    return prisma.donation.findUnique({
      where: { id: id },
    });
  },

  findAllAdmin: async (
    filters: AdminDonationFilters,
  ): Promise<PaginatedDonations> => {
    const where: Prisma.DonationWhereInput = {};

    if (filters.state) {
      where.state = filters.state;
    }

    if (filters.account) {
      where.account = filters.account;
    }

    if (filters.search) {
      const term = filters.search.trim();
      if (term.length > 0) {
        where.OR = [
          { full_name: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
        ];
      }
    }

    const skip = (filters.page - 1) * filters.limit;

    const [data, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: filters.limit,
      }),
      prisma.donation.count({ where }),
    ]);

    return { data, total, page: filters.page, limit: filters.limit };
  },

  expirePending: async (olderThan: Date): Promise<{ id: string }[]> => {
    const expired = await prisma.donation.findMany({
      where: {
        state: 'pending',
        createdAt: { lt: olderThan },
      },
      select: { id: true },
    });

    if (expired.length === 0) {
      return [];
    }

    await prisma.donation.updateMany({
      where: {
        id: { in: expired.map((d) => d.id) },
        state: 'pending',
      },
      data: { state: 'cancelled' },
    });

    return expired;
  },

  findCounter: async (): Promise<DonationCounter | null> => {
    return prisma.donationCounter.findUnique({
      where: { id: DONATION_COUNTER_ID },
    });
  },

  ensureCounterRow: async (): Promise<DonationCounter> => {
    return prisma.donationCounter.upsert({
      where: { id: DONATION_COUNTER_ID },
      update: {},
      create: { id: DONATION_COUNTER_ID, currentValue: 0, metaValue: 0 },
    });
  },

  updateCounter: async (data: UpdateCounterData): Promise<DonationCounter> => {
    const update: Prisma.DonationCounterUpdateInput = {
      updatedBy: data.updatedBy,
    };

    if (data.currentValue !== undefined) {
      update.currentValue = data.currentValue;
    }

    if (data.metaValue !== undefined) {
      update.metaValue = data.metaValue;
    }

    return prisma.donationCounter.upsert({
      where: { id: DONATION_COUNTER_ID },
      update,
      create: {
        id: DONATION_COUNTER_ID,
        currentValue: data.currentValue ?? 0,
        metaValue: data.metaValue ?? 0,
        updatedBy: data.updatedBy,
      },
    });
  },
};
