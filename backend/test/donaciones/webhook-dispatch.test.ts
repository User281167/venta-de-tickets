import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockVerifySignature = vi.hoisted(() => vi.fn());
const mockParseWebhook = vi.hoisted(() => vi.fn());
const mockUpdateState = vi.hoisted(() => vi.fn());
const mockFindByExternalReference = vi.hoisted(() => vi.fn());
const mockNotifyConfirmed = vi.hoisted(() => vi.fn());
const mockNotifyRejected = vi.hoisted(() => vi.fn());
const mockNotifyCancelled = vi.hoisted(() => vi.fn());

vi.mock('../../src/modules/donaciones/providers/donation-provider.registry.js', () => ({
  getDonationProvider: () => ({
    verifySignature: mockVerifySignature,
    parseWebhook: mockParseWebhook,
  }),
}));

vi.mock('../../src/modules/donaciones/donaciones.repository.js', () => ({
  donationRepository: {
    updateStateByExternalReference: mockUpdateState,
    findByExternalReference: mockFindByExternalReference,
    create: vi.fn(),
    findById: vi.fn(),
    findAllAdmin: vi.fn(),
    expirePending: vi.fn(),
  },
}));

vi.mock('../../src/modules/messaging/index.js', () => ({
  notifyDonationConfirmed: mockNotifyConfirmed,
  notifyDonationRejected: mockNotifyRejected,
  notifyDonationCancelled: mockNotifyCancelled,
}));

const { handleWebhook } = await import(
  '../../src/modules/donaciones/donaciones.service.js'
);

describe('donation webhook dispatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifySignature.mockReturnValue(true);
  });

  it('fires confirmation email when webhook status is approved', async () => {
    mockParseWebhook.mockResolvedValue({
      status: 'approved',
      reference: 'DON-LA_CONVENCION-uuid',
      externalId: 'mp-1',
    });
    mockUpdateState.mockResolvedValue(1);
    mockFindByExternalReference.mockResolvedValue({
      id: 'don-1',
      full_name: 'Ana',
      email: 'ana@test.com',
    });

    await handleWebhook('epayco-la-convencion', { x: 1 }, {});

    expect(mockNotifyConfirmed).toHaveBeenCalledWith('don-1');
    expect(mockNotifyRejected).not.toHaveBeenCalled();
    expect(mockNotifyCancelled).not.toHaveBeenCalled();
  });

  it('fires rejection email when webhook status is declined', async () => {
    mockParseWebhook.mockResolvedValue({
      status: 'declined',
      reference: 'DON-LA_CONVENCION-uuid',
      externalId: 'mp-1',
    });
    mockUpdateState.mockResolvedValue(1);
    mockFindByExternalReference.mockResolvedValue({
      id: 'don-2',
      full_name: 'Luis',
      email: 'luis@test.com',
    });

    await handleWebhook('epayco-la-convencion', { x: 1 }, {});

    expect(mockNotifyRejected).toHaveBeenCalledWith('don-2');
    expect(mockNotifyConfirmed).not.toHaveBeenCalled();
    expect(mockNotifyCancelled).not.toHaveBeenCalled();
  });

  it('does not fire any email for pending webhook status', async () => {
    mockParseWebhook.mockResolvedValue({
      status: 'pending',
      reference: 'DON-LA_CONVENCION-uuid',
      externalId: 'mp-1',
    });

    await handleWebhook('epayco-la-convencion', { x: 1 }, {});

    expect(mockNotifyConfirmed).not.toHaveBeenCalled();
    expect(mockNotifyRejected).not.toHaveBeenCalled();
    expect(mockNotifyCancelled).not.toHaveBeenCalled();
    expect(mockUpdateState).not.toHaveBeenCalled();
  });

  it('does not fire email when no row was updated (already terminal)', async () => {
    mockParseWebhook.mockResolvedValue({
      status: 'approved',
      reference: 'DON-LA_CONVENCION-uuid',
      externalId: 'mp-1',
    });
    mockUpdateState.mockResolvedValue(0);

    await handleWebhook('epayco-la-convencion', { x: 1 }, {});

    expect(mockNotifyConfirmed).not.toHaveBeenCalled();
    expect(mockFindByExternalReference).not.toHaveBeenCalled();
  });

  it('returns silently when signature is invalid', async () => {
    mockVerifySignature.mockReturnValue(false);

    await handleWebhook('epayco-la-convencion', { x: 1 }, {});

    expect(mockParseWebhook).not.toHaveBeenCalled();
    expect(mockNotifyConfirmed).not.toHaveBeenCalled();
    expect(mockNotifyRejected).not.toHaveBeenCalled();
  });
});
