import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  donation: {
    findUnique: vi.fn(),
  },
}));

const mockSendConfirmation = vi.hoisted(() => vi.fn());
const mockSendRejection = vi.hoisted(() => vi.fn());
const mockSendCancellation = vi.hoisted(() => vi.fn());

vi.mock('../../src/shared/database/prisma.client.js', () => ({
  prisma: mockPrisma,
}));

vi.mock('../../src/modules/messaging/messaging.service.js', () => ({
  messagingService: {
    sendDonationConfirmation: mockSendConfirmation,
    sendDonationRejection: mockSendRejection,
    sendDonationCancellation: mockSendCancellation,
  },
}));

const notifications = await import(
  '../../src/modules/messaging/notifications/donation-notifications.js'
);

function donationRow(overrides: Partial<{
  id: string;
  full_name: string | null;
  email: string | null;
  amountCents: number;
  account: 'LA_CONVENCION' | 'BARRANQUEROS_UTP';
  updatedAt: Date;
}> = {}) {
  return {
    id: 'don-1',
    full_name: 'Ana',
    email: 'ana@test.com',
    amountCents: 50000,
    account: 'LA_CONVENCION' as const,
    updatedAt: new Date('2026-07-30T12:00:00.000Z'),
    ...overrides,
  };
}

describe('donation notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('notifyDonationConfirmed', () => {
    it('sends confirmation email when donation has email', async () => {
      mockPrisma.donation.findUnique.mockResolvedValue(donationRow());

      await notifications.notifyDonationConfirmed('don-1');

      expect(mockSendConfirmation).toHaveBeenCalledWith({
        donorName: 'Ana',
        donorEmail: 'ana@test.com',
        amountCents: 50000,
        account: 'LA_CONVENCION',
        confirmedAt: new Date('2026-07-30T12:00:00.000Z'),
      });
    });

    it('uses "Anónimo" as donor name when full_name is null', async () => {
      mockPrisma.donation.findUnique.mockResolvedValue(
        donationRow({ full_name: null }),
      );

      await notifications.notifyDonationConfirmed('don-1');

      expect(mockSendConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({ donorName: 'Anónimo' }),
      );
    });

    it('skips sending when donation has no email', async () => {
      mockPrisma.donation.findUnique.mockResolvedValue(
        donationRow({ email: null }),
      );

      await notifications.notifyDonationConfirmed('don-1');

      expect(mockSendConfirmation).not.toHaveBeenCalled();
    });

    it('does not throw when donation is missing', async () => {
      mockPrisma.donation.findUnique.mockResolvedValue(null);

      await expect(
        notifications.notifyDonationConfirmed('missing'),
      ).resolves.toBeUndefined();
      expect(mockSendConfirmation).not.toHaveBeenCalled();
    });
  });

  describe('notifyDonationRejected', () => {
    it('sends rejection email', async () => {
      mockPrisma.donation.findUnique.mockResolvedValue(
        donationRow({ account: 'BARRANQUEROS_UTP' }),
      );

      await notifications.notifyDonationRejected('don-1');

      expect(mockSendRejection).toHaveBeenCalledWith({
        donorName: 'Ana',
        donorEmail: 'ana@test.com',
        amountCents: 50000,
        account: 'BARRANQUEROS_UTP',
        rejectedAt: new Date('2026-07-30T12:00:00.000Z'),
      });
    });

    it('skips when donation has no email', async () => {
      mockPrisma.donation.findUnique.mockResolvedValue(
        donationRow({ email: null }),
      );

      await notifications.notifyDonationRejected('don-1');

      expect(mockSendRejection).not.toHaveBeenCalled();
    });
  });

  describe('notifyDonationCancelled', () => {
    it('sends cancellation email', async () => {
      mockPrisma.donation.findUnique.mockResolvedValue(donationRow());

      await notifications.notifyDonationCancelled('don-1');

      expect(mockSendCancellation).toHaveBeenCalledWith({
        donorName: 'Ana',
        donorEmail: 'ana@test.com',
        amountCents: 50000,
        account: 'LA_CONVENCION',
        cancelledAt: new Date('2026-07-30T12:00:00.000Z'),
      });
    });

    it('skips when donation has no email', async () => {
      mockPrisma.donation.findUnique.mockResolvedValue(
        donationRow({ email: null }),
      );

      await notifications.notifyDonationCancelled('don-1');

      expect(mockSendCancellation).not.toHaveBeenCalled();
    });
  });
});
