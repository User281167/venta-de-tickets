import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/shared/config/env.js', () => ({
  env: {
    CONFIRMATION_LINK_BASE_URL: 'https://frontend.test',
    INFOBIP_API_KEY: 'test-infobip-api-key',
    INFOBIP_BASE_URL: 'https://api.infobip.com',
    INFOBIP_SENDER_ID: 'TestSender',
  },
}));

const mockEmailSend = vi.hoisted(() => vi.fn());
const mockWhatsAppSend = vi.hoisted(() => vi.fn());

vi.mock('../../src/modules/messaging/channels/channel.registry.js', () => ({
  getEmailProvider: () => ({ send: mockEmailSend }),
}));

vi.mock(
  '../../src/modules/messaging/channels/whatsapp-provider.registry.js',
  () => ({
    getWhatsAppProvider: () => ({ send: mockWhatsAppSend }),
  }),
);

const service = await import(
  '../../src/modules/messaging/messaging.service.js'
);

describe('messaging.service WhatsApp dispatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEmailSend.mockResolvedValue(undefined);
    mockWhatsAppSend.mockResolvedValue({ messageId: 'wa-1' });
  });

  it('sendPaymentConfirmation sends email and WhatsApp when phone set', async () => {
    await service.sendPaymentConfirmation({
      customerName: 'Ana',
      customerEmail: 'ana@test.com',
      customerPhone: '+573001234567',
      totalCents: 50000,
      paidAt: new Date('2026-07-30T12:00:00.000Z'),
    });

    expect(mockEmailSend).toHaveBeenCalledTimes(1);
    expect(mockEmailSend.mock.calls[0][0]).toBe('ana@test.com');
    expect(mockEmailSend.mock.calls[0][1]).toMatch(/Pago confirmado/);
    expect(mockWhatsAppSend).toHaveBeenCalledTimes(1);
    const wa = mockWhatsAppSend.mock.calls[0][0];
    expect(wa.to).toBe('+573001234567');
    expect(wa.text).toMatch(/Pago confirmado/);
    expect(wa.text).toMatch(/Ana/);
  });

  it('skips WhatsApp when phone is null', async () => {
    await service.sendPaymentConfirmation({
      customerName: 'Ana',
      customerEmail: 'ana@test.com',
      customerPhone: null,
      totalCents: 50000,
      paidAt: new Date('2026-07-30T12:00:00.000Z'),
    });

    expect(mockEmailSend).toHaveBeenCalledTimes(1);
    expect(mockWhatsAppSend).not.toHaveBeenCalled();
  });

  it('skips WhatsApp when phone is undefined', async () => {
    await service.sendPaymentConfirmation({
      customerName: 'Ana',
      customerEmail: 'ana@test.com',
      totalCents: 50000,
      paidAt: new Date('2026-07-30T12:00:00.000Z'),
    });

    expect(mockWhatsAppSend).not.toHaveBeenCalled();
  });

  it('normalizes unprefixed Colombian numbers before sending WhatsApp', async () => {
    await service.sendPaymentConfirmation({
      customerName: 'Ana',
      customerEmail: 'ana@test.com',
      customerPhone: '(300) 123-4567',
      totalCents: 50000,
      paidAt: new Date('2026-07-30T12:00:00.000Z'),
    });

    expect(mockWhatsAppSend).toHaveBeenCalledTimes(1);
    expect(mockWhatsAppSend.mock.calls[0][0].to).toBe('+573001234567');
  });

  it('skips WhatsApp when phone cannot be normalized', async () => {
    await service.sendPaymentConfirmation({
      customerName: 'Ana',
      customerEmail: 'ana@test.com',
      customerPhone: 'not-a-number',
      totalCents: 50000,
      paidAt: new Date('2026-07-30T12:00:00.000Z'),
    });

    expect(mockEmailSend).toHaveBeenCalledTimes(1);
    expect(mockWhatsAppSend).not.toHaveBeenCalled();
  });

  it('does not propagate WhatsApp errors (fire-and-forget)', async () => {
    mockWhatsAppSend.mockRejectedValue(new Error('Infobip down'));

    await expect(
      service.sendPaymentConfirmation({
        customerName: 'Ana',
        customerEmail: 'ana@test.com',
        customerPhone: '+573001234567',
        totalCents: 50000,
        paidAt: new Date('2026-07-30T12:00:00.000Z'),
      }),
    ).resolves.toBeUndefined();

    await new Promise((r) => setImmediate(r));
    expect(mockEmailSend).toHaveBeenCalledTimes(1);
  });

  it('sendPaymentRefunded dispatches WhatsApp with paymentId in externalId', async () => {
    await service.sendPaymentRefunded({
      customerName: 'Ana',
      customerEmail: 'ana@test.com',
      customerPhone: '+573001234567',
      totalCents: 50000,
      paymentId: 'pay-42',
      reason: 'test',
      refundedAt: new Date('2026-07-30T12:00:00.000Z'),
    });

    expect(mockWhatsAppSend).toHaveBeenCalledTimes(1);
    expect(mockWhatsAppSend.mock.calls[0][0].externalId).toBe(
      'payment-refunded:pay-42',
    );
    expect(mockWhatsAppSend.mock.calls[0][0].text).toMatch(
      /Reembolso confirmado/,
    );
  });

  it('sendTicketPaid dispatches WhatsApp with ticketId in externalId', async () => {
    const qrBuffer = Buffer.from('png');
    await service.sendTicketPaid({
      customerName: 'Ana',
      customerEmail: 'ana@test.com',
      customerPhone: '+573001234567',
      ticketId: 'tkt-1',
      ticketCode: 'ABC123',
      ticketName: 'General',
      qrPngBuffer: qrBuffer,
    });

    expect(mockEmailSend).toHaveBeenCalledTimes(1);
    expect(mockEmailSend.mock.calls[0][3]).toEqual([
      expect.objectContaining({ filename: 'ticket-qr.png' }),
    ]);
    expect(mockWhatsAppSend).toHaveBeenCalledTimes(1);
    expect(mockWhatsAppSend.mock.calls[0][0].externalId).toBe(
      'ticket-paid:tkt-1',
    );
    expect(mockWhatsAppSend.mock.calls[0][0].text).toMatch(/Tu entrada/);
  });

  it('donation functions do not touch WhatsApp', async () => {
    await service.sendDonationConfirmation({
      donorName: 'Ana',
      donorEmail: 'ana@test.com',
      amountCents: 50000,
      account: 'LA_CONVENCION',
      confirmedAt: new Date('2026-07-30T12:00:00.000Z'),
    });

    expect(mockEmailSend).toHaveBeenCalledTimes(1);
    expect(mockWhatsAppSend).not.toHaveBeenCalled();
  });
});
