import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreateCheckout = vi.hoisted(() => vi.fn());
const mockVerifySignature = vi.hoisted(() => vi.fn());
const mockParseWebhook = vi.hoisted(() => vi.fn());

vi.hoisted(() => {
  mockVerifySignature.mockReturnValue(true);
});

vi.mock('../../src/shared/config/env.js', () => ({
  env: { QR_JWT_SECRET: 'test-secret-min-32-chars-long-for-jwt!!' },
}));

vi.mock('../../src/modules/tickets/tickets.service.js', () => ({
  getTicketTypeById: vi.fn(),
  generateQrForTicket: vi.fn(),
}));

vi.mock('../../src/modules/payments/payments.repository.js', () => ({
  createCheckoutReservation: vi.fn(),
  processPaymentWebhook: vi.fn(),
  findByIdWithTickets: vi.fn(),
  findByReference: vi.fn(),
  update: vi.fn(),
  reclaimExpiredPayment: vi.fn(),
  markUnfulfillable: vi.fn(),
}));

vi.mock('../../src/modules/me/me.repository.js', () => ({
  findByUserId: vi.fn(),
}));

vi.mock('../../src/modules/payments/providers/provider.registry.js', () => ({
  getProvider: vi.fn(() => ({
    createCheckout: mockCreateCheckout,
    verifySignature: mockVerifySignature,
    parseWebhook: mockParseWebhook,
  })),
}));

const ticketsService = await import('../../src/modules/tickets/tickets.service.js');
const paymentsRepo = await import('../../src/modules/payments/payments.repository.js');
const meRepo = await import('../../src/modules/me/me.repository.js');
const { getProvider } = await import('../../src/modules/payments/providers/provider.registry.js');
const paymentsService = await import('../../src/modules/payments/payments.service.js');

const mockTicketType = {
  id: 'tt-1',
  name: 'VIP',
  price: 50000,
  quantityTotal: 100,
  quantitySold: 5,
  maxPerUser: 4,
  status: 'enabled',
};

const mockUser = { id: 'user-1', cedula: '12345678', fullName: 'Test User' };

describe('payments.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCheckout', () => {
    it('creates checkout with valid items and returns checkout URL', async () => {
      vi.mocked(meRepo.findByUserId).mockResolvedValue(mockUser);
      vi.mocked(ticketsService.getTicketTypeById).mockResolvedValue(mockTicketType);
      vi.mocked(paymentsRepo.createCheckoutReservation).mockResolvedValue({ paymentId: 'pay-1' });
      mockCreateCheckout.mockResolvedValue({ checkoutUrl: 'https://mp.com/checkout/123', providerTxId: 'pref-123' });

      const result = await paymentsService.createCheckout(
        'user-1',
        [{ ticketTypeId: 'tt-1', quantity: 2 }],
        'https://frontend.com/return',
        'mercadopago',
      );

      expect(mockCreateCheckout).toHaveBeenCalled();
      expect(result).toMatchObject({
        paymentId: expect.any(String),
        checkoutUrl: 'https://mp.com/checkout/123',
        preferenceId: 'pref-123',
      });
    });

    it('throws ValidationError when user not found', async () => {
      vi.mocked(meRepo.findByUserId).mockResolvedValue(null);

      await expect(
        paymentsService.createCheckout('nonexistent', [{ ticketTypeId: 'tt-1', quantity: 1 }], 'https://return.com', 'mercadopago'),
      ).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });
    });

    it('throws ValidationError when user info incomplete', async () => {
      vi.mocked(meRepo.findByUserId).mockResolvedValue({ id: 'user-1', cedula: null, fullName: null });

      await expect(
        paymentsService.createCheckout('user-1', [{ ticketTypeId: 'tt-1', quantity: 1 }], 'https://return.com', 'mercadopago'),
      ).rejects.toMatchObject({ code: 'USER_INFO_INCOMPLETE' });
    });

    it('throws ValidationError when ticket type is disabled', async () => {
      vi.mocked(meRepo.findByUserId).mockResolvedValue(mockUser);
      vi.mocked(ticketsService.getTicketTypeById).mockResolvedValue({ ...mockTicketType, status: 'disabled' });

      await expect(
        paymentsService.createCheckout('user-1', [{ ticketTypeId: 'tt-1', quantity: 1 }], 'https://frontend.com/return', 'mercadopago'),
      ).rejects.toMatchObject({ code: 'TICKET_TYPE_NOT_AVAILABLE' });
    });

    it('throws ValidationError when exceeding maxPerUser', async () => {
      vi.mocked(meRepo.findByUserId).mockResolvedValue(mockUser);
      vi.mocked(ticketsService.getTicketTypeById).mockResolvedValue(mockTicketType);

      await expect(
        paymentsService.createCheckout('user-1', [{ ticketTypeId: 'tt-1', quantity: 5 }], 'https://frontend.com/return', 'mercadopago'),
      ).rejects.toMatchObject({ code: 'MAX_PER_USER_EXCEEDED' });
    });

    it('throws ValidationError when quantity is zero', async () => {
      vi.mocked(meRepo.findByUserId).mockResolvedValue(mockUser);
      vi.mocked(ticketsService.getTicketTypeById).mockResolvedValue(mockTicketType);

      await expect(
        paymentsService.createCheckout('user-1', [{ ticketTypeId: 'tt-1', quantity: 0 }], 'https://frontend.com/return', 'mercadopago'),
      ).rejects.toMatchObject({ code: 'INVALID_QUANTITY' });
    });

    it('throws ValidationError when exceeding available stock', async () => {
      vi.mocked(meRepo.findByUserId).mockResolvedValue(mockUser);
      vi.mocked(ticketsService.getTicketTypeById).mockResolvedValue({ ...mockTicketType, quantitySold: 98, maxPerUser: null });

      await expect(
        paymentsService.createCheckout('user-1', [{ ticketTypeId: 'tt-1', quantity: 5 }], 'https://frontend.com/return', 'mercadopago'),
      ).rejects.toMatchObject({ code: 'SOLD_OUT' });
    });

    it('handles multiple ticket types in single request', async () => {
      vi.mocked(meRepo.findByUserId).mockResolvedValue(mockUser);
      const mockTT1 = { ...mockTicketType, id: 'tt-1', price: 50000, maxPerUser: null };
      const mockTT2 = { ...mockTicketType, id: 'tt-2', name: 'General', price: 25000, maxPerUser: null };

      vi.mocked(ticketsService.getTicketTypeById)
        .mockResolvedValueOnce(mockTT1)
        .mockResolvedValueOnce(mockTT2);

      vi.mocked(paymentsRepo.createCheckoutReservation).mockResolvedValue({ paymentId: 'pay-1' });
      mockCreateCheckout.mockResolvedValue({ checkoutUrl: 'https://mp.com/checkout/123', providerTxId: 'pref-multi' });

      const result = await paymentsService.createCheckout(
        'user-1',
        [
          { ticketTypeId: 'tt-1', quantity: 1 },
          { ticketTypeId: 'tt-2', quantity: 3 },
        ],
        'https://frontend.com/return',
        'mercadopago',
      );

      expect(result).toBeDefined();
      expect(mockCreateCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({ ticketTypeId: 'tt-1', quantity: 1, unitPriceCents: 5000000 }),
            expect.objectContaining({ ticketTypeId: 'tt-2', quantity: 3, unitPriceCents: 2500000 }),
          ]),
        }),
      );
    });
  });

  describe('processWebhook', () => {
    const mockPayment = { id: 'pay-1', status: 'pending', provider: 'mercadopago' };

    it('processes approved payment and generates QR codes', async () => {
      mockParseWebhook.mockResolvedValue({
        reference: 'pay-1',
        status: 'approved',
        externalId: 'mp-tx-123',
        rawPayload: {},
      });

      vi.mocked(paymentsRepo.findByReference).mockResolvedValue(mockPayment);
      vi.mocked(paymentsRepo.processPaymentWebhook).mockResolvedValue({ processed: true });
      vi.mocked(paymentsRepo.findByIdWithTickets).mockResolvedValue({
        id: 'pay-1',
        tickets: [{ id: 'ticket-1' }, { id: 'ticket-2' }],
      });

      const result = await paymentsService.processWebhook(
        {},
        { 'x-signature': 'valid' },
        'mercadopago',
      );

      expect(result).toEqual({ received: true });
      expect(paymentsRepo.processPaymentWebhook).toHaveBeenCalled();
      expect(ticketsService.generateQrForTicket).toHaveBeenCalledTimes(2);
      expect(ticketsService.generateQrForTicket).toHaveBeenCalledWith('ticket-1');
      expect(ticketsService.generateQrForTicket).toHaveBeenCalledWith('ticket-2');
    });

    it('updates payment to failed when webhook status is declined', async () => {
      mockParseWebhook.mockResolvedValue({
        reference: 'pay-1',
        status: 'declined',
        externalId: 'mp-tx-456',
        rawPayload: {},
      });

      vi.mocked(paymentsRepo.findByReference).mockResolvedValue(mockPayment);
      vi.mocked(paymentsRepo.update).mockResolvedValue({} as any);

      const result = await paymentsService.processWebhook(
        {},
        { 'x-signature': 'valid' },
        'mercadopago',
      );

      expect(result).toEqual({ received: true });
      expect(paymentsRepo.update).toHaveBeenCalledWith('pay-1', { status: 'failed' });
      expect(paymentsRepo.processPaymentWebhook).not.toHaveBeenCalled();
    });

    it('skips processing when payment is not pending (idempotent)', async () => {
      mockParseWebhook.mockResolvedValue({
        reference: 'pay-1',
        status: 'approved',
        externalId: 'mp-tx-789',
        rawPayload: {},
      });

      vi.mocked(paymentsRepo.findByReference).mockResolvedValue({ ...mockPayment, status: 'completed' });

      const result = await paymentsService.processWebhook(
        {},
        { 'x-signature': 'valid' },
        'mercadopago',
      );

      expect(result).toEqual({ received: true });
      expect(paymentsRepo.processPaymentWebhook).not.toHaveBeenCalled();
      expect(ticketsService.generateQrForTicket).not.toHaveBeenCalled();
    });

    it('throws NotFoundError when payment does not exist', async () => {
      mockParseWebhook.mockResolvedValue({
        reference: 'nonexistent',
        status: 'approved',
        externalId: 'mp-tx-000',
        rawPayload: {},
      });

      vi.mocked(paymentsRepo.findByReference).mockResolvedValue(null);

      await expect(
        paymentsService.processWebhook({}, { 'x-signature': 'valid' }, 'mercadopago'),
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('returns with logging when payment failed and late approval arrives', async () => {
      mockParseWebhook.mockResolvedValue({
        reference: 'pay-1',
        status: 'approved',
        externalId: 'mp-tx-late',
        rawPayload: {},
      });

      vi.mocked(paymentsRepo.findByReference).mockResolvedValue({ id: 'pay-1', status: 'failed', provider: 'mercadopago' });

      const result = await paymentsService.processWebhook({}, { 'x-signature': 'valid' }, 'mercadopago');

      expect(result).toEqual({ received: true });
      expect(paymentsRepo.processPaymentWebhook).not.toHaveBeenCalled();
    });

    it('returns early when payment expired and event is declined', async () => {
      mockParseWebhook.mockResolvedValue({
        reference: 'pay-1',
        status: 'declined',
        externalId: 'mp-tx-expired',
        rawPayload: {},
      });

      vi.mocked(paymentsRepo.findByReference).mockResolvedValue({ id: 'pay-1', status: 'expired', provider: 'mercadopago' });

      const result = await paymentsService.processWebhook({}, { 'x-signature': 'valid' }, 'mercadopago');

      expect(result).toEqual({ received: true });
      expect(paymentsRepo.reclaimExpiredPayment).not.toHaveBeenCalled();
    });

    it('reclaims expired payment when late approval webhook arrives', async () => {
      mockParseWebhook.mockResolvedValue({
        reference: 'pay-1',
        status: 'approved',
        externalId: 'mp-tx-reclaim',
        rawPayload: {},
      });

      vi.mocked(paymentsRepo.findByReference).mockResolvedValue({ id: 'pay-1', status: 'expired', provider: 'mercadopago' });
      vi.mocked(paymentsRepo.reclaimExpiredPayment).mockResolvedValue({
        outcome: 'reclaimed',
        ticketIds: ['ticket-1', 'ticket-2'],
      });

      const result = await paymentsService.processWebhook({}, { 'x-signature': 'valid' }, 'mercadopago');

      expect(result).toEqual({ received: true });
      expect(paymentsRepo.reclaimExpiredPayment).toHaveBeenCalled();
      expect(ticketsService.generateQrForTicket).toHaveBeenCalledTimes(2);
    });

    it('marks unfulfillable when reclaim fails due to sold out', async () => {
      mockParseWebhook.mockResolvedValue({
        reference: 'pay-1',
        status: 'approved',
        externalId: 'mp-tx-reclaim-fail',
        rawPayload: {},
      });

      vi.mocked(paymentsRepo.findByReference).mockResolvedValue({ id: 'pay-1', status: 'expired', provider: 'mercadopago' });
      vi.mocked(paymentsRepo.reclaimExpiredPayment).mockResolvedValue({ outcome: 'unfulfillable' });

      const result = await paymentsService.processWebhook({}, { 'x-signature': 'valid' }, 'mercadopago');

      expect(result).toEqual({ received: true });
      expect(paymentsRepo.markUnfulfillable).toHaveBeenCalled();
      expect(ticketsService.generateQrForTicket).not.toHaveBeenCalled();
    });

    it('rejects with error when signature is invalid', async () => {
      mockVerifySignature.mockReturnValue(false);

      await expect(
        paymentsService.processWebhook({}, {}, 'mercadopago'),
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_SIGNATURE',
      });

      expect(paymentsRepo.findByReference).not.toHaveBeenCalled();
    });
  });

  describe('getPaymentStatus', () => {
    const mockPaymentWithTickets = {
      id: 'pay-1',
      userId: 'user-1',
      status: 'completed',
      subtotalCents: 50000,
      discountCents: 0,
      totalCents: 50000,
      provider: 'mercadopago',
      tickets: [
        { id: 'ticket-1', ticketCode: 'ABC123', status: 'paid', qrToken: 'eyJ123' },
      ],
    };

    it('returns payment status with tickets for owner', async () => {
      vi.mocked(paymentsRepo.findByIdWithTickets).mockResolvedValue(mockPaymentWithTickets);

      const result = await paymentsService.getPaymentStatus('pay-1', 'user-1', 'client');

      expect(result.id).toBe('pay-1');
      expect(result.tickets).toHaveLength(1);
      expect(result.tickets[0]).toMatchObject({ id: 'ticket-1', qrToken: 'eyJ123' });
    });

    it('returns payment status for admin', async () => {
      vi.mocked(paymentsRepo.findByIdWithTickets).mockResolvedValue(mockPaymentWithTickets);

      const result = await paymentsService.getPaymentStatus('pay-1', 'admin-1', 'admin');

      expect(result.id).toBe('pay-1');
    });

    it('throws NotFoundError when payment not found', async () => {
      vi.mocked(paymentsRepo.findByIdWithTickets).mockResolvedValue(null);

      await expect(
        paymentsService.getPaymentStatus('nonexistent', 'user-1', 'client'),
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('throws ForbiddenError when not owner and not staff', async () => {
      vi.mocked(paymentsRepo.findByIdWithTickets).mockResolvedValue(mockPaymentWithTickets);

      await expect(
        paymentsService.getPaymentStatus('pay-1', 'other-user', 'client'),
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });
});
