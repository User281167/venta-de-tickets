import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFindCounter = vi.hoisted(() => vi.fn());
const mockEnsureCounterRow = vi.hoisted(() => vi.fn());
const mockUpdateCounter = vi.hoisted(() => vi.fn());
const mockIncrementCounter = vi.hoisted(() => vi.fn());
const mockAuditLog = vi.hoisted(() => vi.fn());

vi.mock('../../src/modules/donaciones/donaciones.repository.js', () => ({
  donationRepository: {
    findCounter: mockFindCounter,
    ensureCounterRow: mockEnsureCounterRow,
    updateCounter: mockUpdateCounter,
    incrementCounterBy: mockIncrementCounter,
    create: vi.fn(),
    findById: vi.fn(),
    findByExternalReference: vi.fn(),
    findAllAdmin: vi.fn(),
    expirePending: vi.fn(),
    updateStateByExternalReference: vi.fn(),
  },
}));

vi.mock('../../src/modules/audit/audit.service.js', () => ({
  log: mockAuditLog,
}));

const { getCounter, seedDonationCounter, updateCounter } = await import(
  '../../src/modules/donaciones/donaciones.service.js'
);

describe('donation counter service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCounter', () => {
    it('returns the counter row from a single prisma select', async () => {
      const existing = {
        id: 1,
        currentValue: 1234,
        metaValue: 5000,
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        updatedBy: null,
      };
      mockFindCounter.mockResolvedValue(existing);

      const result = await getCounter();

      expect(mockFindCounter).toHaveBeenCalledTimes(1);
      expect(mockUpdateCounter).not.toHaveBeenCalled();
      expect(mockEnsureCounterRow).not.toHaveBeenCalled();
      expect(result).toBe(existing);
    });

    it('returns null when the row does not exist (seed creates it at startup)', async () => {
      mockFindCounter.mockResolvedValue(null);

      const result = await getCounter();

      expect(result).toBeNull();
    });
  });

  describe('seedDonationCounter', () => {
    it('upserts the singleton row at startup', async () => {
      mockEnsureCounterRow.mockResolvedValue({
        id: 1,
        currentValue: 0,
        metaValue: 0,
        updatedAt: new Date(),
        updatedBy: null,
      });

      await seedDonationCounter();

      expect(mockEnsureCounterRow).toHaveBeenCalledTimes(1);
    });

    it('swallows errors so startup is not blocked', async () => {
      mockEnsureCounterRow.mockRejectedValue(new Error('db down'));

      await expect(seedDonationCounter()).resolves.toBeUndefined();
    });
  });

  describe('updateCounter', () => {
    it('updates fields and writes audit log entry', async () => {
      mockFindCounter.mockResolvedValue({
        id: 1,
        currentValue: 100,
        metaValue: 1000,
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        updatedBy: null,
      });
      const updated = {
        id: 1,
        currentValue: 250,
        metaValue: 5000,
        updatedAt: new Date('2026-02-01T00:00:00Z'),
        updatedBy: 'admin-1',
      };
      mockUpdateCounter.mockResolvedValue(updated);

      const result = await updateCounter(
        { currentValue: 250, metaValue: 5000 },
        { id: 'admin-1' },
      );

      expect(mockUpdateCounter).toHaveBeenCalledWith({
        currentValue: 250,
        metaValue: 5000,
        updatedBy: 'admin-1',
      });
      expect(result).toBe(updated);
      expect(mockAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: 'admin-1',
          entityType: 'Contador de donaciones',
          entityId: '1',
          metadata: expect.objectContaining({
            valorAnterior: { currentValue: 100, metaValue: 1000 },
            valorNuevo: { currentValue: 250, metaValue: 5000 },
          }),
        }),
      );
    });

    it('updates a single field without touching the other', async () => {
      mockFindCounter.mockResolvedValue({
        id: 1,
        currentValue: 100,
        metaValue: 1000,
        updatedAt: new Date(),
        updatedBy: null,
      });
      mockUpdateCounter.mockResolvedValue({
        id: 1,
        currentValue: 100,
        metaValue: 7500,
        updatedAt: new Date(),
        updatedBy: 'admin-1',
      });

      await updateCounter({ metaValue: 7500 }, { id: 'admin-1' });

      expect(mockUpdateCounter).toHaveBeenCalledWith({
        currentValue: undefined,
        metaValue: 7500,
        updatedBy: 'admin-1',
      });
    });
  });
});
