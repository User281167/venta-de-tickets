import { vi, describe, expect, it, beforeEach } from 'vitest';

const { mockPreferenceCreate, mockPaymentGet, mockValidate } = vi.hoisted(() => ({
  mockPreferenceCreate: vi.fn(),
  mockPaymentGet: vi.fn(),
  mockValidate: vi.fn(),
}));

vi.mock('mercadopago', () => ({
  MercadoPagoConfig: vi.fn(),
  Preference: function () {
    return { create: mockPreferenceCreate };
  },
  Payment: function () {
    return { get: mockPaymentGet };
  },
  WebhookSignatureValidator: {
    validate: mockValidate,
  },
}));

import { MercadoPagoProvider } from '../../../src/modules/payments/providers/mercadopago.provider.js';

describe('MercadoPagoProvider', () => {
  let provider: MercadoPagoProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new MercadoPagoProvider();
  });

  describe('createCheckout', () => {
    const baseInput = {
      externalReference: 'payment-123',
      items: [
        {
          ticketTypeId: 'tt-vip',
          name: 'VIP Access',
          quantity: 2,
          unitPriceCents: 25000,
        },
      ],
      backUrl: 'https://frontend.test/mi-cuenta/tiquetes',
      expiresAt: '2026-07-08T20:38:00Z',
      payerEmail: 'buyer@example.com',
    };

    it('creates preference with correct shape', async () => {
      mockPreferenceCreate.mockResolvedValue({
        id: '787997534-6dad21a1-6145-4f0d-ac21-66bf7a5e7a58',
        init_point:
          'https://www.mercadopago.com.co/checkout/v1/redirect?preference_id=787997534-6dad21a1-6145-4f0d-ac21-66bf7a5e7a58',
      });

      const result = await provider.createCheckout(baseInput);

      expect(mockPreferenceCreate).toHaveBeenCalledTimes(1);
      expect(mockPreferenceCreate).toHaveBeenCalledWith({
        body: {
          items: [
            {
              id: 'tt-vip',
              title: 'VIP Access',
              quantity: 2,
              unit_price: 250,
            },
          ],
          external_reference: 'payment-123',
          back_urls: {
            success: 'https://frontend.test/mi-cuenta/tiquetes',
            failure: 'https://frontend.test/mi-cuenta/tiquetes',
            pending: 'https://frontend.test/mi-cuenta/tiquetes',
          },
          notification_url: expect.stringContaining('/api/payments/webhook'),
          payer: { email: 'buyer@example.com' },
          date_of_expiration: '2026-07-08T20:38:00Z',
        },
      });

      expect(result.checkoutUrl).toBe(
        'https://www.mercadopago.com.co/checkout/v1/redirect?preference_id=787997534-6dad21a1-6145-4f0d-ac21-66bf7a5e7a58',
      );
      expect(result.providerTxId).toBe(
        '787997534-6dad21a1-6145-4f0d-ac21-66bf7a5e7a58',
      );
    });

    it('handles multiple items with different types', async () => {
      mockPreferenceCreate.mockResolvedValue({
        id: 'pref-multi',
        init_point: 'https://checkout.url',
      });

      await provider.createCheckout({
        ...baseInput,
        items: [
          {
            ticketTypeId: 'tt-vip',
            name: 'VIP Access',
            quantity: 1,
            unitPriceCents: 50000,
          },
          {
            ticketTypeId: 'tt-general',
            name: 'General Admission',
            quantity: 3,
            unitPriceCents: 15000,
          },
        ],
      });

      const callBody = mockPreferenceCreate.mock.calls[0][0].body;
      expect(callBody.items).toHaveLength(2);
      expect(callBody.items[0]).toEqual({
        id: 'tt-vip',
        title: 'VIP Access',
        quantity: 1,
        unit_price: 500,
      });
      expect(callBody.items[1]).toEqual({
        id: 'tt-general',
        title: 'General Admission',
        quantity: 3,
        unit_price: 150,
      });
    });

    it('converts unitPriceCents to integer pesos (divide by 100, round)', async () => {
      mockPreferenceCreate.mockResolvedValue({
        id: 'pref-1',
        init_point: 'https://checkout.url',
      });

      await provider.createCheckout({
        ...baseInput,
        items: [
          {
            ticketTypeId: 'tt-test',
            name: 'Test',
            quantity: 1,
            unitPriceCents: 9999,
          },
        ],
      });

      const callBody = mockPreferenceCreate.mock.calls[0][0].body;
      expect(callBody.items[0].unit_price).toBe(100);
    });

    it('omits payer when payerEmail not provided', async () => {
      mockPreferenceCreate.mockResolvedValue({
        id: 'pref-3',
        init_point: 'https://checkout.url',
      });

      await provider.createCheckout({
        ...baseInput,
        payerEmail: undefined,
      });

      const callBody = mockPreferenceCreate.mock.calls[0][0].body;
      expect(callBody.payer).toBeUndefined();
    });
  });

  describe('verifySignature', () => {
    it('returns true for valid signature', () => {
      mockValidate.mockImplementation(() => undefined);

      const result = provider.verifySignature(
        { data: { id: '12345' }, type: 'payment' },
        {
          'x-signature': 'ts=1709123456,v1=abc123',
          'x-request-id': 'req-123',
        },
      );

      expect(result).toBe(true);
      expect(mockValidate).toHaveBeenCalledWith({
        xSignature: 'ts=1709123456,v1=abc123',
        xRequestId: 'req-123',
        dataId: '12345',
        secret: expect.any(String),
      });
    });

    it('returns false when validate throws', () => {
      mockValidate.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const result = provider.verifySignature(
        { data: { id: '12345' }, type: 'payment' },
        {
          'x-signature': 'ts=1709123456,v1=badhash',
          'x-request-id': 'req-123',
        },
      );

      expect(result).toBe(false);
    });

    it('returns false when x-signature header missing', () => {
      const result = provider.verifySignature(
        { data: { id: '12345' }, type: 'payment' },
        { 'x-request-id': 'req-123' } as Record<string, string>,
      );

      expect(result).toBe(false);
    });

    it('returns false when x-request-id header missing', () => {
      const result = provider.verifySignature(
        { data: { id: '12345' }, type: 'payment' },
        { 'x-signature': 'ts=123,v1=abc' } as Record<string, string>,
      );

      expect(result).toBe(false);
    });

    it('passes data.id from payload to validator', () => {
      mockValidate.mockImplementation(() => undefined);

      provider.verifySignature(
        { data: { id: '98765' }, type: 'payment' },
        {
          'x-signature': 'ts=123,v1=abc',
          'x-request-id': 'req-456',
        },
      );

      expect(mockValidate).toHaveBeenCalledWith(
        expect.objectContaining({ dataId: '98765' }),
      );
    });
  });

  describe('parseWebhook', () => {
    it('maps approved status correctly', async () => {
      mockPaymentGet.mockResolvedValue({
        external_reference: 'payment-123',
        status: 'approved',
        id: 12345,
      });

      const result = await provider.parseWebhook({
        type: 'payment',
        data: { id: '12345' },
      });

      expect(result.reference).toBe('payment-123');
      expect(result.status).toBe('approved');
      expect(result.externalId).toBe('12345');
    });

    it('maps rejected status to declined', async () => {
      mockPaymentGet.mockResolvedValue({
        external_reference: 'payment-456',
        status: 'rejected',
        id: 67890,
      });

      const result = await provider.parseWebhook({
        type: 'payment',
        data: { id: '67890' },
      });

      expect(result.status).toBe('declined');
    });

    it('maps cancelled status to declined', async () => {
      mockPaymentGet.mockResolvedValue({
        external_reference: 'payment-789',
        status: 'cancelled',
        id: 11111,
      });

      const result = await provider.parseWebhook({
        type: 'payment',
        data: { id: '11111' },
      });

      expect(result.status).toBe('declined');
    });

    it('maps refunded status to declined', async () => {
      mockPaymentGet.mockResolvedValue({
        external_reference: 'payment-000',
        status: 'refunded',
        id: 33333,
      });

      const result = await provider.parseWebhook({
        type: 'payment',
        data: { id: '33333' },
      });

      expect(result.status).toBe('declined');
    });

    it('maps unknown status to pending', async () => {
      mockPaymentGet.mockResolvedValue({
        external_reference: 'payment-999',
        status: 'in_process',
        id: 22222,
      });

      const result = await provider.parseWebhook({
        type: 'payment',
        data: { id: '22222' },
      });

      expect(result.status).toBe('pending');
    });

    it('throws on non-payment event type', async () => {
      await expect(
        provider.parseWebhook({ type: 'test', data: { id: '12345' } }),
      ).rejects.toThrow('Invalid webhook payload');
    });

    it('throws on missing data.id', async () => {
      await expect(
        provider.parseWebhook({ type: 'payment', data: {} }),
      ).rejects.toThrow('Invalid webhook payload');
    });

    it('preserves raw payload in result', async () => {
      const rawPayload = { type: 'payment', data: { id: '55555' } };

      mockPaymentGet.mockResolvedValue({
        external_reference: 'payment-555',
        status: 'approved',
        id: 55555,
      });

      const result = await provider.parseWebhook(rawPayload);

      expect(result.rawPayload).toBe(rawPayload);
    });
  });
});
