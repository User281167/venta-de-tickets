import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const ticketMock = {
    findUnique: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  };

  const tx = {
    $queryRaw: vi.fn(),
    ticket: ticketMock,
  };

  return {
    mockTx: tx,
    mockPrisma: {
      $transaction: vi.fn((fn: (tx: typeof tx) => unknown) => fn(tx)),
      ticket: ticketMock,
    },
  };
});

vi.mock('../../src/shared/database/prisma.client.js', () => ({
  prisma: mockPrisma,
}));

import * as repo from '../../src/modules/checkin/checkin.repository.js';

describe('checkin.repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('confirmEntryDirect', () => {
    it('returns true when transition affects 1 row', async () => {
      mockPrisma.ticket.updateMany.mockResolvedValue({ count: 1 });

      const result = await repo.confirmEntryDirect('ticket-1', 'checker-1');

      expect(result).toBe(true);
      expect(mockPrisma.ticket.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ticket-1', status: 'paid' },
          data: expect.objectContaining({
            status: 'used',
            checkedInBy: 'checker-1',
          }),
        }),
      );
    });

    it('returns false when transition affects 0 rows (race lost)', async () => {
      mockPrisma.ticket.updateMany.mockResolvedValue({ count: 0 });

      const result = await repo.confirmEntryDirect('ticket-1', 'checker-1');

      expect(result).toBe(false);
    });
  });

  describe('requestConfirmation', () => {
    it('locks the row, transitions paid -> pending_confirmation, returns buyer contact', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1' }]);
      mockTx.ticket.findUnique.mockResolvedValue({
        status: 'paid',
        user: {
          fullName: 'Maria Garcia',
          email: 'maria@example.com',
          phone: '+573001234567',
        },
      });
      mockTx.ticket.update.mockResolvedValue({ id: 'ticket-1' });

      const result = await repo.requestConfirmation('ticket-1');

      expect(mockTx.$queryRaw).toHaveBeenCalled();
      expect(result).toEqual({
        ok: true,
        buyer: {
          fullName: 'Maria Garcia',
          email: 'maria@example.com',
          phone: '+573001234567',
        },
      });
    });

    it('returns not_found when FOR UPDATE finds no row', async () => {
      mockTx.$queryRaw.mockResolvedValue([]);

      const result = await repo.requestConfirmation('nonexistent');

      expect(result).toEqual({ ok: false, reason: 'not_found' });
      expect(mockTx.ticket.findUnique).not.toHaveBeenCalled();
      expect(mockTx.ticket.update).not.toHaveBeenCalled();
    });

    it('returns not_available when ticket status is not paid', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1' }]);
      mockTx.ticket.findUnique.mockResolvedValue({
        status: 'confirmed',
        user: { fullName: 'x', email: null, phone: null },
      });

      const result = await repo.requestConfirmation('ticket-1');

      expect(result).toEqual({ ok: false, reason: 'not_available' });
      expect(mockTx.ticket.update).not.toHaveBeenCalled();
    });
  });

  describe('allowEntry', () => {
    it('returns true on confirmed -> used', async () => {
      mockPrisma.ticket.updateMany.mockResolvedValue({ count: 1 });

      const result = await repo.allowEntry('ticket-1', 'checker-1');

      expect(result).toBe(true);
      expect(mockPrisma.ticket.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ticket-1', status: 'confirmed' },
        }),
      );
    });

    it('returns false when transition affects 0 rows', async () => {
      mockPrisma.ticket.updateMany.mockResolvedValue({ count: 0 });

      const result = await repo.allowEntry('ticket-1', 'checker-1');

      expect(result).toBe(false);
    });
  });

  describe('confirmTicket', () => {
    it('returns true on pending_confirmation -> confirmed', async () => {
      mockPrisma.ticket.updateMany.mockResolvedValue({ count: 1 });

      const result = await repo.confirmTicket('ticket-1');

      expect(result).toBe(true);
      expect(mockPrisma.ticket.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ticket-1', status: 'pending_confirmation' },
          data: { status: 'confirmed' },
        }),
      );
    });

    it('returns false when transition affects 0 rows', async () => {
      mockPrisma.ticket.updateMany.mockResolvedValue({ count: 0 });

      const result = await repo.confirmTicket('ticket-1');

      expect(result).toBe(false);
    });
  });

  describe('rejectConfirmation', () => {
    it('returns true on pending_confirmation -> paid', async () => {
      mockTx.ticket.findUnique.mockResolvedValue({ status: 'pending_confirmation' });
      mockTx.ticket.updateMany.mockResolvedValue({ count: 1 });

      const result = await repo.rejectConfirmation('ticket-1');

      expect(result).toBe(true);
    });

    it('returns false when ticket does not exist', async () => {
      mockTx.ticket.findUnique.mockResolvedValue(null);

      const result = await repo.rejectConfirmation('nonexistent');

      expect(result).toBe(false);
      expect(mockTx.ticket.updateMany).not.toHaveBeenCalled();
    });

    it('returns false when ticket is not in pending_confirmation', async () => {
      mockTx.ticket.findUnique.mockResolvedValue({ status: 'paid' });

      const result = await repo.rejectConfirmation('ticket-1');

      expect(result).toBe(false);
      expect(mockTx.ticket.updateMany).not.toHaveBeenCalled();
    });
  });
});
