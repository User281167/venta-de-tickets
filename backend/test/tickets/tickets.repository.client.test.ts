import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  ticket: {
    findMany: vi.fn(),
    count: vi.fn(),
    findFirst: vi.fn(),
  },
}));

vi.mock('../../src/shared/database/prisma.client.js', () => ({
  prisma: mockPrisma,
}));

import * as repo from '../../src/modules/tickets/tickets.repository.js';

const mockTicketRow = {
  id: 'ticket-1',
  ticketCode: 'TC001',
  qrToken: 'jwt-token',
  status: 'paid',
  purchasedAt: new Date('2026-07-09T00:00:00Z'),
  createdAt: new Date('2026-07-09T00:00:00Z'),
  ticketType: {
    id: 'tt-1',
    name: 'General',
    price: 50000,
  },
};

describe('tickets.repository.client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('returns paginated tickets for given user ordered by createdAt desc', async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([mockTicketRow]);

      const result = await repo.findByUserId('user-1', 1, 20);

      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', status: { not: 'expired' } },
        select: expect.any(Object),
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].ticketCode).toBe('TC001');
    });

    it('returns empty array when user has no tickets', async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([]);

      const result = await repo.findByUserId('user-2', 1, 20);

      expect(result).toEqual([]);
    });

    it('applies pagination skip correctly', async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([]);

      await repo.findByUserId('user-1', 3, 10);

      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });
  });

  describe('countByUserId', () => {
    it('returns total ticket count for user', async () => {
      mockPrisma.ticket.count.mockResolvedValue(5);

      const result = await repo.countByUserId('user-1');

      expect(mockPrisma.ticket.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', status: { not: 'expired' } },
      });
      expect(result).toBe(5);
    });

    it('returns 0 when user has no tickets', async () => {
      mockPrisma.ticket.count.mockResolvedValue(0);

      const result = await repo.countByUserId('user-2');

      expect(result).toBe(0);
    });
  });

  describe('findOwnedById', () => {
    it('returns ticket when id and userId match', async () => {
      mockPrisma.ticket.findFirst.mockResolvedValue(mockTicketRow);

      const result = await repo.findOwnedById('ticket-1', 'user-1');

      expect(mockPrisma.ticket.findFirst).toHaveBeenCalledWith({
        where: { id: 'ticket-1', userId: 'user-1' },
        select: expect.any(Object),
      });
      expect(result?.id).toBe('ticket-1');
    });

    it('returns null when ticket exists but belongs to different user', async () => {
      mockPrisma.ticket.findFirst.mockResolvedValue(null);

      const result = await repo.findOwnedById('ticket-1', 'other-user');

      expect(result).toBeNull();
    });

    it('returns null when ticket does not exist', async () => {
      mockPrisma.ticket.findFirst.mockResolvedValue(null);

      const result = await repo.findOwnedById('nonexistent', 'user-1');

      expect(result).toBeNull();
    });
  });
});
