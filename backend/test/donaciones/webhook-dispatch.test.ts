import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockParseWebhook = vi.hoisted(() => vi.fn());
const mockUpdateState = vi.hoisted(() => vi.fn());
const mockIncrementCounter = vi.hoisted(() => vi.fn());
const mockNotifyConfirmed = vi.hoisted(() => vi.fn());
const mockNotifyRejected = vi.hoisted(() => vi.fn());
const mockNotifyCancelled = vi.hoisted(() => vi.fn());

vi.mock('../../src/modules/donaciones/providers/donation-provider.registry.js', () => ({
  getDonationProvider: () => ({
    parseWebhook: mockParseWebhook,
  }),
}));

vi.mock('../../src/modules/donaciones/donaciones.repository.js', () => ({
  donationRepository: {
    updateStateByExternalReference: mockUpdateState,
    incrementCounterBy: mockIncrementCounter,
    create: vi.fn(),
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

const { handleWebhook } = await import(
  '../../src/modules/donaciones/donaciones.service.js'
);

describe('donation webhook dispatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIncrementCounter.mockResolvedValue({
      id: 1,
      currentValue: 0,
      metaValue: 0,
      updatedAt: new Date(),
      updatedBy: null,
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

  it('increments donation counter by donation amount when donation is confirmed', async () => {
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

    // counter runs fire-and-forget; flush microtasks before assertion
    await new Promise((r) => setImmediate(r));
    expect(mockIncrementCounter).toHaveBeenCalledWith(150000);
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

    await new Promise((r) => setImmediate(r));
    expect(mockIncrementCounter).not.toHaveBeenCalled();
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

    await new Promise((r) => setImmediate(r));
    expect(mockIncrementCounter).not.toHaveBeenCalled();
    expect(mockNotifyConfirmed).not.toHaveBeenCalled();
  });

  it('still fires confirmation email even if counter increment fails', async () => {
    mockParseWebhook.mockResolvedValue({
      status: 'approved',
      reference: 'DON-LA_CONVENCION-uuid',
      externalId: 'mp-1',
    });
    mockUpdateState.mockResolvedValue({
      id: 'don-5',
      full_name: 'Sofia',
      email: 'sofia@test.com',
      amountCents: 50000,
    });
    mockIncrementCounter.mockRejectedValue(new Error('counter DB down'));

    await handleWebhook('epayco-la-convencion', { x: 1 }, {});

    await new Promise((r) => setImmediate(r));
    expect(mockNotifyConfirmed).toHaveBeenCalledWith('don-5');
  });
});
