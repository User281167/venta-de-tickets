import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockParseWebhook = vi.hoisted(() => vi.fn());
const mockUpdateState = vi.hoisted(() => vi.fn());
const mockNotifyConfirmed = vi.hoisted(() => vi.fn());
const mockNotifyRejected = vi.hoisted(() => vi.fn());
const mockNotifyCancelled = vi.hoisted(() => vi.fn());
const mockCreate = vi.hoisted(() => vi.fn());
const mockCreatePreference = vi.hoisted(() => vi.fn());
const mockCreateDonationUUID = vi.hoisted(() => vi.fn(() => 'uuid-1'));

vi.mock('../../src/modules/donaciones/providers/donation-provider.registry.js', () => ({
  getDonationProvider: () => ({
    createPreference: mockCreatePreference,
    parseWebhook: mockParseWebhook,
  }),
}));

vi.mock('../../src/modules/donaciones/donaciones.repository.js', () => ({
  createDonationUUID: mockCreateDonationUUID,
  donationRepository: {
    updateStateByExternalReference: mockUpdateState,
    create: mockCreate,
    findById: vi.fn(),
    findByExternalReference: vi.fn(),
    findAllAdmin: vi.fn(),
    expirePending: vi.fn(),
    findCounter: vi.fn(),
    updateCounter: vi.fn(),
  },
}));

vi.mock('../../src/modules/messaging/index.js', () => ({
  notifyDonationConfirmed: mockNotifyConfirmed,
  notifyDonationRejected: mockNotifyRejected,
  notifyDonationCancelled: mockNotifyCancelled,
}));

const { createDonation, handleWebhook } = await import(
  '../../src/modules/donaciones/donaciones.service.js'
);

describe('donation webhook dispatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreatePreference.mockResolvedValue({
      initPoint: 'https://checkout.test/session',
      sessionId: 'session-1',
    });
  });

  it('fires confirmation email when webhook status is approved', async () => {
    mockParseWebhook.mockResolvedValue({
      status: 'approved',
      reference: 'DON-LA_CONVENCION-uuid',
      externalId: 'mp-1',
    });
    mockUpdateState.mockResolvedValue({
      id: 'don-1',
      full_name: 'Ana',
      email: 'ana@test.com',
      amountCents: 50000,
    });

    await handleWebhook('epayco-la-convencion', { x: 1 }, {});

    expect(mockNotifyConfirmed).toHaveBeenCalledWith('don-1');
    expect(mockNotifyRejected).not.toHaveBeenCalled();
    expect(mockNotifyCancelled).not.toHaveBeenCalled();
  });

  it('persists the pending donation before requesting the payment session', async () => {
    mockCreate.mockResolvedValue({ id: 'don-1' });

    await createDonation({
      fullName: 'Ana',
      email: 'ana@test.com',
      company: null,
      amountCents: 50000,
      account: 'VICTIMAS',
      provider: 'epayco',
      backUrl: 'https://frontend.test/donar',
    });

    expect(mockCreate.mock.invocationCallOrder[0]).toBeLessThan(
      mockCreatePreference.mock.invocationCallOrder[0]!,
    );
  });

  it('fires rejection email when webhook status is declined', async () => {
    mockParseWebhook.mockResolvedValue({
      status: 'declined',
      reference: 'DON-LA_CONVENCION-uuid',
      externalId: 'mp-1',
    });
    mockUpdateState.mockResolvedValue({
      id: 'don-2',
      full_name: 'Luis',
      email: 'luis@test.com',
      amountCents: 50000,
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
    mockUpdateState.mockResolvedValue(null);

    await handleWebhook('epayco-la-convencion', { x: 1 }, {});

    expect(mockNotifyConfirmed).not.toHaveBeenCalled();
  });

  it('delegates confirmation accounting to the atomic repository transaction', async () => {
    mockParseWebhook.mockResolvedValue({
      status: 'approved',
      reference: 'DON-LA_CONVENCION-uuid',
      externalId: 'mp-1',
    });
    mockUpdateState.mockResolvedValue({
      id: 'don-3',
      full_name: 'Maria',
      email: 'maria@test.com',
      amountCents: 150000,
    });

    await handleWebhook('epayco-la-convencion', { x: 1 }, {});

    expect(mockUpdateState).toHaveBeenCalledWith(
      'DON-LA_CONVENCION-uuid',
      expect.objectContaining({ state: 'confirmed' }),
    );
    expect(mockNotifyConfirmed).toHaveBeenCalledWith('don-3');
  });

  it('does not increment counter when donation is rejected', async () => {
    mockParseWebhook.mockResolvedValue({
      status: 'declined',
      reference: 'DON-LA_CONVENCION-uuid',
      externalId: 'mp-1',
    });
    mockUpdateState.mockResolvedValue({
      id: 'don-4',
      full_name: 'Pedro',
      email: 'pedro@test.com',
      amountCents: 50000,
    });

    await handleWebhook('epayco-la-convencion', { x: 1 }, {});

    expect(mockNotifyRejected).toHaveBeenCalledWith('don-4');
  });

  it('does not increment counter when webhook arrives for a terminal donation', async () => {
    mockParseWebhook.mockResolvedValue({
      status: 'approved',
      reference: 'DON-LA_CONVENCION-uuid',
      externalId: 'mp-1',
    });
    mockUpdateState.mockResolvedValue(null);

    await handleWebhook('epayco-la-convencion', { x: 1 }, {});

    expect(mockNotifyConfirmed).not.toHaveBeenCalled();
  });

});
