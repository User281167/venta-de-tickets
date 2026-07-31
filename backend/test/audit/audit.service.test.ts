import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreate = vi.hoisted(() => vi.fn());
const mockFindMany = vi.hoisted(() => vi.fn());
const mockUserFindUnique = vi.hoisted(() => vi.fn());

vi.mock('../../src/modules/audit/audit.repository.js', () => ({
  auditRepository: {
    create: mockCreate,
    findMany: mockFindMany,
  },
}));

vi.mock('../../src/shared/database/prisma.client.js', () => ({
  prisma: {
    user: {
      findUnique: mockUserFindUnique,
    },
  },
}));

vi.mock('../../src/utils/logger.js', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { auditUserCache } from '../../src/modules/audit/auditUser.cache.js';
import * as auditService from '../../src/modules/audit/audit.service.js';

describe('audit.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auditUserCache.clear();
  });

  describe('log', () => {
    it('uses cached snapshot when available (no DB lookup)', async () => {
      auditUserCache.set('user-1', {
        role: 'admin',
        fullName: 'Cached Ana',
        cedula: '11111111',
      });
      mockCreate.mockResolvedValue({ id: 'log-1' });

      await auditService.log({
        eventId: 'evt-1',
        actorId: 'user-1',
        action: 'ticket_type.created',
        entityType: 'TicketType',
        entityId: 'tt-1',
        metadata: { name: 'VIP' },
      });

      expect(mockUserFindUnique).not.toHaveBeenCalled();
      expect(mockCreate).toHaveBeenCalledWith(
        {
          eventId: 'evt-1',
          actorId: 'user-1',
          action: 'ticket_type.created',
          entityType: 'TicketType',
          entityId: 'tt-1',
          metadata: { name: 'VIP' },
        },
        { role: 'admin', fullName: 'Cached Ana', cedula: '11111111' },
      );
    });

    it('fetches from DB and populates cache on miss', async () => {
      mockUserFindUnique.mockResolvedValue({
        role: 'checker',
        fullName: 'Carla',
        cedula: '22222222',
      });
      mockCreate.mockResolvedValue({ id: 'log-2' });

      await auditService.log({
        eventId: 'evt-1',
        actorId: 'user-2',
        action: 'ticket.checked_in',
        entityType: 'Ticket',
        entityId: 't-1',
      });

      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { id: 'user-2' },
        select: { role: true, fullName: true, cedula: true },
      });
      expect(mockCreate).toHaveBeenCalledWith(
        expect.any(Object),
        { role: 'checker', fullName: 'Carla', cedula: '22222222' },
      );
      expect(auditUserCache.get('user-2')).toEqual({
        role: 'checker',
        fullName: 'Carla',
        cedula: '22222222',
      });
    });

    it('writes unknown snapshot when user is gone (does not cache)', async () => {
      mockUserFindUnique.mockResolvedValue(null);
      mockCreate.mockResolvedValue({ id: 'log-3' });

      await auditService.log({
        eventId: 'evt-1',
        actorId: 'user-gone',
        action: 'payment.status_changed',
        entityType: 'Payment',
        entityId: 'p-1',
      });

      expect(mockCreate).toHaveBeenCalledWith(expect.any(Object), {
        role: 'unknown',
        fullName: null,
        cedula: null,
      });
      expect(auditUserCache.get('user-gone')).toBeNull();
    });

    it('never throws when repository fails (fire-and-forget contract)', async () => {
      auditUserCache.set('user-3', { role: 'admin', fullName: 'X', cedula: null });
      mockCreate.mockRejectedValue(new Error('db down'));

      await expect(
        auditService.log({
          eventId: 'evt-1',
          actorId: 'user-3',
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
