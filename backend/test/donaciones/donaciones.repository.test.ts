import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DonationStatus } from '@prisma/client';

const mockPrisma = vi.hoisted(() => ({
  donation: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    updateMany: vi.fn(),
  },
}));

vi.mock('../../src/shared/database/prisma.client.js', () => ({
  prisma: mockPrisma,
}));

import { donationRepository } from '../../src/modules/donaciones/donaciones.repository.js';

describe('donaciones.repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findById', () => {
    it('returns the donation when found', async () => {
      const donation = {
        id: 'don-1',
        full_name: 'Ana',
        email: 'ana@test.com',
        amountCents: 50000,
        state: 'confirmed',
        account: 'LA_CONVENCION',
        externalReference: 'DON-LA_CONVENCION-uuid',
        paymentId: 'mp-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.donation.findUnique.mockResolvedValue(donation);

      const result = await donationRepository.findById('don-1');

      expect(mockPrisma.donation.findUnique).toHaveBeenCalledWith({
        where: { id: 'don-1' },
      });
      expect(result).toEqual(donation);
    });

    it('returns null when not found', async () => {
      mockPrisma.donation.findUnique.mockResolvedValue(null);

      const result = await donationRepository.findById('missing');

      expect(result).toBeNull();
    });
  });

  describe('findAllAdmin', () => {
    it('builds where clause from filters and paginates', async () => {
      const rows = [{ id: 'don-1' }, { id: 'don-2' }];
      mockPrisma.donation.findMany.mockResolvedValue(rows);
      mockPrisma.donation.count.mockResolvedValue(2);

      const result = await donationRepository.findAllAdmin({
        page: 2,
        limit: 25,
        state: DonationStatus.confirmed,
        account: 'LA_CONVENCION',
        search: 'ana',
      });

      expect(mockPrisma.donation.findMany).toHaveBeenCalledWith({
        where: {
          state: 'confirmed',
          account: 'LA_CONVENCION',
          OR: [
            { full_name: { contains: 'ana', mode: 'insensitive' } },
            { email: { contains: 'ana', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        skip: 25,
        take: 25,
      });
      expect(mockPrisma.donation.count).toHaveBeenCalledWith({
        where: {
          state: 'confirmed',
          account: 'LA_CONVENCION',
          OR: [
            { full_name: { contains: 'ana', mode: 'insensitive' } },
            { email: { contains: 'ana', mode: 'insensitive' } },
          ],
        },
      });
      expect(result).toEqual({ data: rows, total: 2, page: 2, limit: 25 });
    });

    it('omits OR clause when search is blank', async () => {
      mockPrisma.donation.findMany.mockResolvedValue([]);
      mockPrisma.donation.count.mockResolvedValue(0);

      await donationRepository.findAllAdmin({
        page: 1,
        limit: 50,
        search: '   ',
      });

      const call = mockPrisma.donation.findMany.mock.calls[0][0];
      expect(call.where.OR).toBeUndefined();
    });

    it('returns empty paginated result when no filters and no data', async () => {
      mockPrisma.donation.findMany.mockResolvedValue([]);
      mockPrisma.donation.count.mockResolvedValue(0);

      const result = await donationRepository.findAllAdmin({
        page: 1,
        limit: 50,
      });

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 50 });
    });
  });

  describe('expirePending', () => {
    it('finds then updates pending donations older than cutoff', async () => {
      const cutoff = new Date('2026-07-30T12:00:00.000Z');
      const found = [{ id: 'don-1' }, { id: 'don-2' }];
      mockPrisma.donation.findMany.mockResolvedValue(found);
      mockPrisma.donation.updateMany.mockResolvedValue({ count: 2 });

      const result = await donationRepository.expirePending(cutoff);

      expect(mockPrisma.donation.findMany).toHaveBeenCalledWith({
        where: {
          state: 'pending',
          createdAt: { lt: cutoff },
        },
        select: { id: true },
      });
      expect(mockPrisma.donation.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['don-1', 'don-2'] },
          state: 'pending',
        },
        data: { state: 'cancelled' },
      });
      expect(result).toEqual(found);
    });

    it('returns empty array and skips update when no expired rows', async () => {
      mockPrisma.donation.findMany.mockResolvedValue([]);

      const result = await donationRepository.expirePending(new Date());

      expect(result).toEqual([]);
      expect(mockPrisma.donation.updateMany).not.toHaveBeenCalled();
    });
  });
});
