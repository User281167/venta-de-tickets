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

const { messagingClient } = await import(
  '../../src/modules/messaging/messaging.client.js'
);

describe('messagingClient.sendConfirmationLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEmailSend.mockResolvedValue(undefined);
    mockWhatsAppSend.mockResolvedValue({ messageId: 'wa-1' });
  });

  it('sends both email and WhatsApp when both contacts present', async () => {
    await messagingClient.sendConfirmationLink({
      ticketId: 'tkt-1',
      buyerName: 'Ana',
      email: 'ana@test.com',
      phone: '+573001234567',
      confirmationUrl: 'https://frontend.test/confirm?token=x',
      qrImageUrl: 'https://frontend.test/mi-cuenta/entradas/tkt-1',
    });

    expect(mockEmailSend).toHaveBeenCalledTimes(1);
    expect(mockEmailSend.mock.calls[0][0]).toBe('ana@test.com');
    expect(mockEmailSend.mock.calls[0][1]).toMatch(/Confirma tu entrada/);

    expect(mockWhatsAppSend).toHaveBeenCalledTimes(1);
    const wa = mockWhatsAppSend.mock.calls[0][0];
    expect(wa.to).toBe('+573001234567');
    expect(wa.text).toMatch(/Confirma tu entrada/);
    expect(wa.text).toMatch(/https:\/\/frontend\.test\/confirm\?token=x/);
    expect(wa.externalId).toBe('confirmation-link:tkt-1');
  });

  it('sends only WhatsApp when email is null', async () => {
    await messagingClient.sendConfirmationLink({
      ticketId: 'tkt-1',
      buyerName: 'Ana',
      email: null,
      phone: '+573001234567',
      confirmationUrl: 'https://frontend.test/confirm?token=x',
      qrImageUrl: 'https://frontend.test/mi-cuenta/entradas/tkt-1',
    });

    expect(mockEmailSend).not.toHaveBeenCalled();
    expect(mockWhatsAppSend).toHaveBeenCalledTimes(1);
  });

  it('sends only email when phone is null', async () => {
    await messagingClient.sendConfirmationLink({
      ticketId: 'tkt-1',
      buyerName: 'Ana',
      email: 'ana@test.com',
      phone: null,
      confirmationUrl: 'https://frontend.test/confirm?token=x',
      qrImageUrl: 'https://frontend.test/mi-cuenta/entradas/tkt-1',
    });

    expect(mockEmailSend).toHaveBeenCalledTimes(1);
    expect(mockWhatsAppSend).not.toHaveBeenCalled();
  });

  it('swallows WhatsApp errors silently (fire-and-forget)', async () => {
    mockWhatsAppSend.mockRejectedValue(new Error('boom'));

    await expect(
      messagingClient.sendConfirmationLink({
        ticketId: 'tkt-1',
        buyerName: 'Ana',
        email: 'ana@test.com',
        phone: '+573001234567',
        confirmationUrl: 'https://frontend.test/confirm?token=x',
        qrImageUrl: 'https://frontend.test/mi-cuenta/entradas/tkt-1',
      }),
    ).resolves.toBeUndefined();
  });
});
