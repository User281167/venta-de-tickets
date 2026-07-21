import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/shared/config/env.js', () => ({
  env: {
    QR_JWT_SECRET: 'test-qr-secret-min-32-chars-long-for-jwt!!',
    CONFIRMATION_JWT_SECRET: 'test-confirm-secret-min-32-chars-long!!',
    CONFIRMATION_TOKEN_TTL: '30m',
    CONFIRMATION_LINK_BASE_URL: 'https://frontend.test',
  },
}));

const mockFindTicketForScan = vi.hoisted(() => vi.fn());
const mockConfirmEntryDirect = vi.hoisted(() => vi.fn());
const mockAllowEntry = vi.hoisted(() => vi.fn());
const mockRequestConfirmation = vi.hoisted(() => vi.fn());

vi.mock('../../src/modules/checkin/checkin.repository.js', () => ({
  findTicketForScan: mockFindTicketForScan,
  confirmEntryDirect: mockConfirmEntryDirect,
  allowEntry: mockAllowEntry,
  requestConfirmation: mockRequestConfirmation,
}));

const mockSendConfirmationLink = vi.hoisted(() => vi.fn());

vi.mock('../../src/modules/messaging/index.js', () => ({
  messagingClient: {
    sendConfirmationLink: mockSendConfirmationLink,
  },
}));

import jwt from 'jsonwebtoken';
import * as checkinService from '../../src/modules/checkin/checkin.service.js';

describe('checkin.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('scanTicket', () => {
    it('returns ticket summary with allowedActions for paid ticket', async () => {
      const qrToken = jwt.sign(
        { tid: 'ticket-1' },
        'test-qr-secret-min-32-chars-long-for-jwt!!',
      );
      mockFindTicketForScan.mockResolvedValue({
        ticketId: 'ticket-1',
        status: 'paid',
        attendeeName: 'Maria Garcia',
        attendeeCedula: '12345678',
        ticketTypeName: 'General',
        checkedInAt: null,
        allowedActions: [],
      });

      const result = await checkinService.scanTicket(qrToken);

      expect(result.allowedActions).toEqual([
        'confirm_entry_direct',
        'request_confirmation',
      ]);
    });

    it('returns empty allowedActions for used ticket', async () => {
      const qrToken = jwt.sign(
        { tid: 'ticket-1' },
        'test-qr-secret-min-32-chars-long-for-jwt!!',
      );
      mockFindTicketForScan.mockResolvedValue({
        ticketId: 'ticket-1',
        status: 'used',
        attendeeName: 'Maria',
        attendeeCedula: '12345678',
        ticketTypeName: 'General',
        checkedInAt: '2026-07-20T15:00:00.000Z',
        allowedActions: [],
      });

      const result = await checkinService.scanTicket(qrToken);

      expect(result.allowedActions).toEqual([]);
    });

    it('returns allow_entry for confirmed ticket', async () => {
      const qrToken = jwt.sign(
        { tid: 'ticket-1' },
        'test-qr-secret-min-32-chars-long-for-jwt!!',
      );
      mockFindTicketForScan.mockResolvedValue({
        ticketId: 'ticket-1',
        status: 'confirmed',
        attendeeName: 'Maria',
        attendeeCedula: '12345678',
        ticketTypeName: 'General',
        checkedInAt: null,
        allowedActions: [],
      });

      const result = await checkinService.scanTicket(qrToken);

      expect(result.allowedActions).toEqual(['allow_entry']);
    });

    it('throws INVALID_QR when JWT signature is invalid', async () => {
      await expect(
        checkinService.scanTicket('not-a-jwt'),
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_QR',
      });
    });

    it('throws NOT_FOUND when ticket does not exist', async () => {
      const qrToken = jwt.sign(
        { tid: 'nonexistent' },
        'test-qr-secret-min-32-chars-long-for-jwt!!',
      );
      mockFindTicketForScan.mockResolvedValue(null);

      await expect(checkinService.scanTicket(qrToken)).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    });
  });

  describe('confirmEntryDirect', () => {
    it('resolves when repo returns true', async () => {
      mockConfirmEntryDirect.mockResolvedValue(true);

      await expect(
        checkinService.confirmEntryDirect('ticket-1', 'checker-1'),
      ).resolves.toBeUndefined();
    });

    it('throws ConflictError when repo returns false (race lost)', async () => {
      mockConfirmEntryDirect.mockResolvedValue(false);

      await expect(
        checkinService.confirmEntryDirect('ticket-1', 'checker-1'),
      ).rejects.toMatchObject({
        statusCode: 409,
        code: 'CONFLICT',
      });
    });
  });

  describe('race condition: two concurrent confirm-entry on same ticket', () => {
    it('exactly one resolves, the other rejects with 409', async () => {
      let callCount = 0;
      mockConfirmEntryDirect.mockImplementation(async () => {
        callCount += 1;
        if (callCount === 1) return true;
        return false;
      });

      const results = await Promise.allSettled([
        checkinService.confirmEntryDirect('ticket-1', 'checker-A'),
        checkinService.confirmEntryDirect('ticket-1', 'checker-B'),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);
      expect((rejected[0] as PromiseRejectedResult).reason).toMatchObject({
        statusCode: 409,
        code: 'CONFLICT',
      });
      expect(mockConfirmEntryDirect).toHaveBeenCalledTimes(2);
    });
  });

  describe('requestConfirmation', () => {
    it('sends confirmation link when repo returns ok with buyer contact', async () => {
      mockRequestConfirmation.mockResolvedValue({
        ok: true,
        buyer: {
          fullName: 'Maria Garcia',
          email: 'maria@example.com',
          phone: null,
        },
      });
      mockSendConfirmationLink.mockResolvedValue(undefined);

      await checkinService.requestConfirmation('ticket-1', 'checker-1');

      expect(mockSendConfirmationLink).toHaveBeenCalledTimes(1);
      const payload = mockSendConfirmationLink.mock.calls[0][0];
      expect(payload.channel).toBe('email');
      expect(payload.buyerContact).toBe('maria@example.com');
      expect(payload.ticketId).toBe('ticket-1');
      expect(payload.confirmationUrl).toMatch(/^https:\/\/frontend\.test\/confirmaciones\?token=/);
    });

    it('uses whatsapp when buyer has no email but has phone', async () => {
      mockRequestConfirmation.mockResolvedValue({
        ok: true,
        buyer: {
          fullName: 'Maria',
          email: null,
          phone: '+573001234567',
        },
      });
      mockSendConfirmationLink.mockResolvedValue(undefined);

      await checkinService.requestConfirmation('ticket-1', 'checker-1');

      expect(mockSendConfirmationLink.mock.calls[0][0].channel).toBe('whatsapp');
      expect(mockSendConfirmationLink.mock.calls[0][0].buyerContact).toBe('+573001234567');
    });

    it('does not send link when buyer has no contact info', async () => {
      mockRequestConfirmation.mockResolvedValue({
        ok: true,
        buyer: { fullName: 'Maria', email: null, phone: null },
      });

      await checkinService.requestConfirmation('ticket-1', 'checker-1');

      expect(mockSendConfirmationLink).not.toHaveBeenCalled();
    });

    it('throws NotFoundError when repo returns not_found', async () => {
      mockRequestConfirmation.mockResolvedValue({
        ok: false,
        reason: 'not_found',
      });

      await expect(
        checkinService.requestConfirmation('ticket-1', 'checker-1'),
      ).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
    });

    it('throws ConflictError when repo returns not_available', async () => {
      mockRequestConfirmation.mockResolvedValue({
        ok: false,
        reason: 'not_available',
      });

      await expect(
        checkinService.requestConfirmation('ticket-1', 'checker-1'),
      ).rejects.toMatchObject({ statusCode: 409, code: 'CONFLICT' });
    });
  });

  describe('allowEntry', () => {
    it('resolves when repo returns true', async () => {
      mockAllowEntry.mockResolvedValue(true);

      await expect(
        checkinService.allowEntry('ticket-1', 'checker-1'),
      ).resolves.toBeUndefined();
    });

    it('throws ConflictError when repo returns false', async () => {
      mockAllowEntry.mockResolvedValue(false);

      await expect(
        checkinService.allowEntry('ticket-1', 'checker-1'),
      ).rejects.toMatchObject({ statusCode: 409, code: 'CONFLICT' });
    });
  });
});
