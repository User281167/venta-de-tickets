import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';

const mockSend = vi.hoisted(() => vi.fn());
const mockGetEmailProvider = vi.hoisted(() => vi.fn());

vi.mock('../../src/modules/messaging/channels/channel.registry.js', () => ({
  getEmailProvider: mockGetEmailProvider,
}));

const { sendDonationConfirmation, sendDonationRejection, sendDonationCancellation } =
  await import('../../src/modules/messaging/messaging.service.js');

function readTemplate(name: string): string {
  return readFileSync(
    new URL(`../../src/modules/messaging/templates/${name}.html`, import.meta.url),
    'utf-8',
  );
}

describe('donation messaging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetEmailProvider.mockReturnValue({ send: mockSend });
  });

  describe('sendDonationConfirmation', () => {
    it('sends email to donor with confirmation subject and rendered template', async () => {
      await sendDonationConfirmation({
        donorName: 'Ana Pérez',
        donorEmail: 'ana@test.com',
        amountCents: 5000000,
        account: 'LA_CONVENCION',
        confirmedAt: new Date('2026-07-30T12:00:00.000Z'),
      });

      expect(mockSend).toHaveBeenCalledTimes(1);
      const [to, subject, html] = mockSend.mock.calls[0];

      expect(to).toBe('ana@test.com');
      expect(subject).toMatch(/Donación confirmada/);

      const template = readTemplate('donation-confirmed');
      expect(html).toContain(template.substring(0, 500));
      expect(html).toContain('https://frontend.test');
      expect(html).toContain('Ana Pérez');
    });

    it('formats amount as COP with no decimals and includes donor + account', async () => {
      await sendDonationConfirmation({
        donorName: 'Ana',
        donorEmail: 'a@b.com',
        amountCents: 250000,
        account: 'BARRANQUEROS_UTP',
        confirmedAt: new Date('2026-07-30T12:00:00.000Z'),
      });

      const html = mockSend.mock.calls[0][2] as string;
      expect(html).toContain('$\u00A02.500');
      expect(html).toContain('Barranqueros UTP');
      expect(html).toContain('Ana');
    });
  });

  describe('sendDonationRejection', () => {
    it('sends email to donor with neutral rejection subject and rendered template', async () => {
      await sendDonationRejection({
        donorName: 'Luis',
        donorEmail: 'luis@test.com',
        amountCents: 100000,
        account: 'LA_CONVENCION',
        rejectedAt: new Date('2026-07-30T12:00:00.000Z'),
      });

      const [to, subject, html] = mockSend.mock.calls[0];
      expect(to).toBe('luis@test.com');
      expect(subject).toMatch(/No pudimos procesar tu donación/);

      const template = readTemplate('donation-rejected');
      expect(html).toContain(template.substring(0, 500));
      expect(html).toContain('https://frontend.test');
      expect(html).toContain('Luis');
    });
  });

  describe('sendDonationCancellation', () => {
    it('sends email to donor with cancellation subject and rendered template', async () => {
      await sendDonationCancellation({
        donorName: 'Sofía',
        donorEmail: 'sofia@test.com',
        amountCents: 75000,
        account: 'BARRANQUEROS_UTP',
        cancelledAt: new Date('2026-07-30T12:00:00.000Z'),
      });

      const [to, subject, html] = mockSend.mock.calls[0];
      expect(to).toBe('sofia@test.com');
      expect(subject).toMatch(/Tu donación expiró/);

      const template = readTemplate('donation-cancelled');
      expect(html).toContain(template.substring(0, 500));
      expect(html).toContain('https://frontend.test');
      expect(html).toContain('Sofía');
    });
  });
});
