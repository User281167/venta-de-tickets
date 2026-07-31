import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreate = vi.hoisted(() => vi.fn());
const mockFindMany = vi.hoisted(() => vi.fn());

vi.mock('../../src/modules/audit/audit.repository.js', () => ({
  auditRepository: {
    create: mockCreate,
    findMany: mockFindMany,
  },
}));

vi.mock('../../src/utils/logger.js', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import * as auditService from '../../src/modules/audit/audit.service.js';

describe('audit.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('log', () => {
    it('delegates to repository.create on success', async () => {
      mockCreate.mockResolvedValue({ id: 'log-1' });

      await auditService.log({
        eventId: 'evt-1',
        actorId: 'user-1',
        actorRole: 'admin',
        action: 'ticket_type.created',
        entityType: 'TicketType',
        entityId: 'tt-1',
        metadata: { name: 'VIP', price: 100 },
      });

      expect(mockCreate).toHaveBeenCalledWith({
        eventId: 'evt-1',
        actorId: 'user-1',
        actorRole: 'admin',
        action: 'ticket_type.created',
        entityType: 'TicketType',
        entityId: 'tt-1',
        metadata: { name: 'VIP', price: 100 },
      });
    });

    it('never throws when repository fails (fire-and-forget contract)', async () => {
      mockCreate.mockRejectedValue(new Error('db down'));

      await expect(
        auditService.log({
          eventId: 'evt-1',
          actorId: 'user-1',
          actorRole: 'admin',
          action: 'ticket_type.created',
          entityType: 'TicketType',
          entityId: 'tt-1',
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('list', () => {
    it('returns hasMore=false and nextCursor=null when under limit', async () => {
      mockFindMany.mockResolvedValue([{ id: 'log-1' }, { id: 'log-2' }]);

      const result = await auditService.list({ limit: 50 });

      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
      expect(result.data).toHaveLength(2);
    });

    it('trims the extra row and reports hasMore=true when repository returns limit+1', async () => {
      const rows = Array.from({ length: 11 }, (_, i) => ({ id: `log-${i}` }));
      mockFindMany.mockResolvedValue(rows);

      const result = await auditService.list({ limit: 10 });

      expect(result.data).toHaveLength(10);
      expect(result.hasMore).toBe(true);
    });

    it('passes through filters to repository', async () => {
      mockFindMany.mockResolvedValue([]);
      const since = new Date('2026-07-31T10:00:00.000Z');

      await auditService.list({ since, entityType: 'Payment', limit: 25 });

      expect(mockFindMany).toHaveBeenCalledWith({
        since,
        entityType: 'Payment',
        limit: 25,
      });
    });
  });
});
