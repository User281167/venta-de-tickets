import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
  };

  return {
    mockTx: tx,
    mockPrisma: {
      $transaction: vi.fn((fn: Function) => fn(tx)),
      $queryRaw: vi.fn(),
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

  describe('checkInDirect', () => {
    it('returns entered when ticket is paid', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'paid', checked_in_at: null }]);
      mockTx.$executeRaw.mockResolvedValue([1]);

      const result = await repo.checkInDirect('ticket-1', 'checker-1');

      expect(result).toEqual({ action: 'entered', ticket: { id: 'ticket-1' } });
      expect(mockTx.$executeRaw).toHaveBeenCalled();
    });

    it('returns not_found when ticket does not exist', async () => {
      mockTx.$queryRaw.mockResolvedValue([]);

      const result = await repo.checkInDirect('nonexistent', 'checker-1');

      expect(result).toEqual({ action: 'not_found' });
      expect(mockTx.$executeRaw).not.toHaveBeenCalled();
    });

    it('returns already_used when ticket already used', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'used', checked_in_at: new Date() }]);

      const result = await repo.checkInDirect('ticket-1', 'checker-1');

      expect(result).toEqual({ action: 'already_used', ticket: { checkedInAt: expect.any(Date) } });
      expect(mockTx.$executeRaw).not.toHaveBeenCalled();
    });

    it('returns wrong_status when ticket is reserved', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'reserved', checked_in_at: null }]);

      const result = await repo.checkInDirect('ticket-1', 'checker-1');

      expect(result).toEqual({ action: 'wrong_status', currentStatus: 'reserved' });
      expect(mockTx.$executeRaw).not.toHaveBeenCalled();
    });

    it('returns wrong_status when ticket is pending_confirmation', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'pending_confirmation', checked_in_at: null }]);

      const result = await repo.checkInDirect('ticket-1', 'checker-1');

      expect(result).toEqual({ action: 'wrong_status', currentStatus: 'pending_confirmation' });
    });

    it('returns wrong_status when ticket is confirmed', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'confirmed', checked_in_at: null }]);

      const result = await repo.checkInDirect('ticket-1', 'checker-1');

      expect(result).toEqual({ action: 'wrong_status', currentStatus: 'confirmed' });
    });

    it('returns wrong_status when ticket is cancelled', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'cancelled', checked_in_at: null }]);

      const result = await repo.checkInDirect('ticket-1', 'checker-1');

      expect(result).toEqual({ action: 'wrong_status', currentStatus: 'cancelled' });
    });

    it('returns wrong_status when ticket is expired', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'expired', checked_in_at: null }]);

      const result = await repo.checkInDirect('ticket-1', 'checker-1');

      expect(result).toEqual({ action: 'wrong_status', currentStatus: 'expired' });
    });
  });

  describe('requestConfirmation', () => {
    it('returns pending_confirmation when ticket is paid', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'paid', checked_in_at: null }]);
      mockTx.$executeRaw.mockResolvedValue([1]);

      const result = await repo.requestConfirmation('ticket-1', 'checker-1');

      expect(result).toEqual({ action: 'pending_confirmation', ticket: { id: 'ticket-1' } });
    });

    it('returns not_found when ticket does not exist', async () => {
      mockTx.$queryRaw.mockResolvedValue([]);

      const result = await repo.requestConfirmation('nonexistent', 'checker-1');

      expect(result).toEqual({ action: 'not_found' });
    });

    it('returns already_used when ticket already used', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'used', checked_in_at: new Date() }]);

      const result = await repo.requestConfirmation('ticket-1', 'checker-1');

      expect(result).toEqual({ action: 'already_used', ticket: { checkedInAt: expect.any(Date) } });
    });

    it('returns wrong_status when ticket is not paid', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'reserved', checked_in_at: null }]);

      const result = await repo.requestConfirmation('ticket-1', 'checker-1');

      expect(result).toEqual({ action: 'wrong_status', currentStatus: 'reserved' });
    });

    it('returns wrong_status when update affected 0 rows (race condition)', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'paid', checked_in_at: null }]);
      mockTx.$executeRaw.mockResolvedValue(0);

      const result = await repo.requestConfirmation('ticket-1', 'checker-1');

      expect(result).toEqual({ action: 'wrong_status', currentStatus: 'paid' });
    });
  });

  describe('confirmTicket', () => {
    it('returns confirmed_entry when ticket is pending_confirmation', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'pending_confirmation', checked_in_at: null }]);
      mockTx.$executeRaw.mockResolvedValue([1]);

      const result = await repo.confirmTicket('ticket-1');

      expect(result).toEqual({ action: 'confirmed_entry', ticket: { id: 'ticket-1' } });
    });

    it('returns not_found when ticket does not exist', async () => {
      mockTx.$queryRaw.mockResolvedValue([]);

      const result = await repo.confirmTicket('nonexistent');

      expect(result).toEqual({ action: 'not_found' });
    });

    it('returns already_used when ticket already used', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'used', checked_in_at: new Date() }]);

      const result = await repo.confirmTicket('ticket-1');

      expect(result).toEqual({ action: 'already_used', ticket: { checkedInAt: expect.any(Date) } });
    });

    it('returns wrong_status when ticket is not pending_confirmation', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'paid', checked_in_at: null }]);

      const result = await repo.confirmTicket('ticket-1');

      expect(result).toEqual({ action: 'wrong_status', currentStatus: 'paid' });
    });

    it('returns wrong_status when update affected 0 rows (race condition)', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'pending_confirmation', checked_in_at: null }]);
      mockTx.$executeRaw.mockResolvedValue(0);

      const result = await repo.confirmTicket('ticket-1');

      expect(result).toEqual({ action: 'wrong_status', currentStatus: 'pending_confirmation' });
    });
  });

  describe('rejectConfirmation', () => {
    it('reverts ticket from pending_confirmation to paid', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'pending_confirmation', checked_in_at: null }]);
      mockTx.$executeRaw.mockResolvedValue([1]);

      const result = await repo.rejectConfirmation('ticket-1');

      expect(result).toEqual({ action: 'wrong_status', currentStatus: 'paid' });
      expect(mockTx.$executeRaw).toHaveBeenCalled();
    });

    it('returns not_found when ticket does not exist', async () => {
      mockTx.$queryRaw.mockResolvedValue([]);

      const result = await repo.rejectConfirmation('nonexistent');

      expect(result).toEqual({ action: 'not_found' });
    });

    it('returns wrong_status when ticket is not pending_confirmation', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'paid', checked_in_at: null }]);

      const result = await repo.rejectConfirmation('ticket-1');

      expect(result).toEqual({ action: 'wrong_status', currentStatus: 'paid' });
      expect(mockTx.$executeRaw).not.toHaveBeenCalled();
    });
  });

  describe('allowEntry', () => {
    it('returns entered when ticket is confirmed', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'confirmed', checked_in_at: null }]);
      mockTx.$executeRaw.mockResolvedValue([1]);

      const result = await repo.allowEntry('ticket-1', 'checker-1');

      expect(result).toEqual({ action: 'entered', ticket: { id: 'ticket-1' } });
    });

    it('returns not_found when ticket does not exist', async () => {
      mockTx.$queryRaw.mockResolvedValue([]);

      const result = await repo.allowEntry('nonexistent', 'checker-1');

      expect(result).toEqual({ action: 'not_found' });
    });

    it('returns already_used when ticket already used', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'used', checked_in_at: new Date() }]);

      const result = await repo.allowEntry('ticket-1', 'checker-1');

      expect(result).toEqual({ action: 'already_used', ticket: { checkedInAt: expect.any(Date) } });
    });

    it('returns wrong_status when ticket is paid (not confirmed)', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'paid', checked_in_at: null }]);

      const result = await repo.allowEntry('ticket-1', 'checker-1');

      expect(result).toEqual({ action: 'wrong_status', currentStatus: 'paid' });
    });

    it('returns wrong_status when ticket is pending_confirmation', async () => {
      mockTx.$queryRaw.mockResolvedValue([{ id: 'ticket-1', status: 'pending_confirmation', checked_in_at: null }]);

      const result = await repo.allowEntry('ticket-1', 'checker-1');

      expect(result).toEqual({ action: 'wrong_status', currentStatus: 'pending_confirmation' });
    });
  });

  describe('findByPendingConfirmationAndConfirmed', () => {
    it('returns pending and confirmed tickets ordered by confirmation_requested_at', async () => {
      const expectedRows = [
        { id: 'ticket-1', ticket_code: 'TC001', status: 'pending_confirmation', confirmation_requested_at: new Date() },
        { id: 'ticket-2', ticket_code: 'TC002', status: 'confirmed', confirmation_requested_at: null },
      ];
      mockPrisma.$queryRaw.mockResolvedValue(expectedRows);

      const result = await repo.findByPendingConfirmationAndConfirmed();

      expect(result).toEqual(expectedRows);
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    it('returns empty array when no matching tickets', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const result = await repo.findByPendingConfirmationAndConfirmed();

      expect(result).toEqual([]);
    });
  });
});
