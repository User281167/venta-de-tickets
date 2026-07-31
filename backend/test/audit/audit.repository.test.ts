import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '@prisma/client';

const mockPrisma = vi.hoisted(() => ({
  auditLog: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock('../../src/shared/database/prisma.client.js', () => ({
  prisma: mockPrisma,
}));

import { auditRepository } from '../../src/modules/audit/audit.repository.js';

describe('audit.repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('persists actor snapshot fields and action metadata', async () => {
      const metadata = { priceBefore: 50000, priceAfter: 60000 };
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await auditRepository.create(
        {
          eventId: 'evt-1',
          actorId: 'user-1',
          action: 'ticket_type.price_updated',
          entityType: 'TicketType',
          entityId: 'tt-1',
          metadata,
        },
        { role: 'admin', fullName: 'Ana Admin', cedula: '12345678' },
      );

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          eventId: 'evt-1',
          actorId: 'user-1',
          actorRole: 'admin',
          actorName: 'Ana Admin',
          actorCedula: '12345678',
          action: 'ticket_type.price_updated',
          entityType: 'TicketType',
          entityId: 'tt-1',
          metadata,
        },
      });
    });

    it('accepts null actorName and actorCedula (unknown actor snapshot)', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-2' });

      await auditRepository.create(
        {
          eventId: 'evt-1',
          actorId: 'user-gone',
          action: 'ticket.checked_in',
          entityType: 'Ticket',
          entityId: 't-1',
        },
        { role: 'unknown', fullName: null, cedula: null },
      );

      const call = mockPrisma.auditLog.create.mock.calls[0][0];
      expect(call.data.actorName).toBeNull();
      expect(call.data.actorCedula).toBeNull();
    });

    it('stores Prisma.JsonNull sentinel when metadata is omitted', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-3' });

      await auditRepository.create(
        {
          eventId: 'evt-1',
          actorId: 'user-1',
          action: 'ticket.checked_in',
          entityType: 'Ticket',
          entityId: 't-1',
        },
        { role: 'checker', fullName: 'Carla', cedula: null },
      );

      const call = mockPrisma.auditLog.create.mock.calls[0][0];
      expect(call.data.metadata).toBe(Prisma.JsonNull);
    });
  });

  describe('findMany', () => {
    it('builds where from since and entityType and orders desc by createdAt then id', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);

      const since = new Date('2026-07-31T12:00:00.000Z');
      await auditRepository.findMany({
        since,
        entityType: 'TicketType',
        limit: 50,
      });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: { gt: since },
          entityType: 'TicketType',
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 51,
      });
    });

    it('omits since filter when not provided', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);

      await auditRepository.findMany({ limit: 25 });

      const call = mockPrisma.auditLog.findMany.mock.calls[0][0];
      expect(call.where.createdAt).toBeUndefined();
    });

    it('over-fetches by 1 to support hasMore detection', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);

      await auditRepository.findMany({ limit: 10 });

      const call = mockPrisma.auditLog.findMany.mock.calls[0][0];
      expect(call.take).toBe(11);
    });
  });
});
