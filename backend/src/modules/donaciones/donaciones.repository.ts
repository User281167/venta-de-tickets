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
        state: data.state === 'confirmed' ? { in: ['pending', 'rejected'] } : 'pending',
      },
      data: {
        state: data.state,
        paymentId: data.paymentId,
        metadata: data.metadata,
      },
    });
    return result.count;
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

  expirePending: async (
    olderThan: Date,
  ): Promise<{ id: string }[]> => {
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
};
