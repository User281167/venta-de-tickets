import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockExpirePending = vi.hoisted(() => vi.fn());
const mockNotifyCancelled = vi.hoisted(() => vi.fn());

vi.mock('../../src/shared/config/constants.js', () => ({
  DONATION_EXPIRY_INTERVAL_MILLIS: 20 * 60 * 1000,
}));

vi.mock('../../src/modules/donaciones/donaciones.repository.js', () => ({
  donationRepository: {
    expirePending: mockExpirePending,
  },
}));

vi.mock('../../src/modules/messaging/index.js', () => ({
  notifyDonationCancelled: mockNotifyCancelled,
  notifyDonationConfirmed: vi.fn(),
  notifyDonationRejected: vi.fn(),
}));

const { sweepExpiredDonations } = await import(
  '../../src/modules/donaciones/donaciones.service.js'
);

describe('sweepExpiredDonations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 0 and fires no emails when no donations expired', async () => {
    mockExpirePending.mockResolvedValue([]);

    const count = await sweepExpiredDonations();

    expect(count).toBe(0);
    expect(mockNotifyCancelled).not.toHaveBeenCalled();
  });

  it('cancels expired donations and fires one email per id', async () => {
    mockExpirePending.mockResolvedValue([
      { id: 'don-1' },
      { id: 'don-2' },
      { id: 'don-3' },
    ]);

    const count = await sweepExpiredDonations();

    expect(count).toBe(3);
    expect(mockNotifyCancelled).toHaveBeenCalledTimes(3);
    expect(mockNotifyCancelled).toHaveBeenNthCalledWith(1, 'don-1');
    expect(mockNotifyCancelled).toHaveBeenNthCalledWith(2, 'don-2');
    expect(mockNotifyCancelled).toHaveBeenNthCalledWith(3, 'don-3');
  });

  it('passes a cutoff 20 minutes in the past to the repository', async () => {
    mockExpirePending.mockResolvedValue([]);
    const before = Date.now() - 20 * 60 * 1000;

    await sweepExpiredDonations();

    expect(mockExpirePending).toHaveBeenCalledTimes(1);
    const cutoff = mockExpirePending.mock.calls[0][0] as Date;
    expect(cutoff).toBeInstanceOf(Date);
    const drift = Math.abs(cutoff.getTime() - before);
    expect(drift).toBeLessThan(1000);
  });
});
