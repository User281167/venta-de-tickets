import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCheckInDirect = vi.hoisted(() => vi.fn());

vi.mock('../../src/shared/config/env.js', () => ({
  env: { QR_JWT_SECRET: 'test-secret-min-32-chars-long-for-jwt!!' },
}));

vi.mock('../../src/modules/checkin/checkin.repository.js', () => ({
  checkInDirect: mockCheckInDirect,
}));

import jwt from 'jsonwebtoken';
import * as checkinService from '../../src/modules/checkin/checkin.service.js';

describe('checkin.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkIn', () => {
    it('returns success with ticket id when check-in succeeds', async () => {
      const qrToken = jwt.sign({ tid: 'ticket-1', iat: Date.now() }, 'test-secret-min-32-chars-long-for-jwt!!');
      mockCheckInDirect.mockResolvedValue({ action: 'entered', ticket: { id: 'ticket-1' } });

      const result = await checkinService.checkIn(qrToken, 'checker-1');

      expect(result).toEqual({ success: true, ticket: { id: 'ticket-1' } });
      expect(mockCheckInDirect).toHaveBeenCalledWith('ticket-1', 'checker-1');
    });

    it('throws INVALID_QR when JWT signature is invalid', async () => {
      const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';

      await expect(checkinService.checkIn(tamperedToken, 'checker-1')).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_QR',
      });
      expect(mockCheckInDirect).not.toHaveBeenCalled();
    });

    it('throws INVALID_QR when JWT payload has no tid', async () => {
      const qrToken = jwt.sign({ foo: 'bar' }, 'test-secret-min-32-chars-long-for-jwt!!');

      mockCheckInDirect.mockResolvedValue({ action: 'not_found' });
      await expect(checkinService.checkIn(qrToken, 'checker-1')).rejects.toThrow('Ticket not found');
    });

    it('throws NOT_FOUND when ticket does not exist', async () => {
      const qrToken = jwt.sign({ tid: 'nonexistent', iat: Date.now() }, 'test-secret-min-32-chars-long-for-jwt!!');
      mockCheckInDirect.mockResolvedValue({ action: 'not_found' });

      await expect(checkinService.checkIn(qrToken, 'checker-1')).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    });

    it('throws TICKET_NOT_AVAILABLE (409) when ticket already used', async () => {
      const qrToken = jwt.sign({ tid: 'ticket-1', iat: Date.now() }, 'test-secret-min-32-chars-long-for-jwt!!');
      mockCheckInDirect.mockResolvedValue({ action: 'already_used', ticket: { checkedInAt: new Date() } });

      await expect(checkinService.checkIn(qrToken, 'checker-1')).rejects.toMatchObject({
        statusCode: 409,
        code: 'TICKET_NOT_AVAILABLE',
        currentStatus: 'used',
      });
    });

    it('throws TICKET_NOT_AVAILABLE (409) when ticket has wrong status', async () => {
      const qrToken = jwt.sign({ tid: 'ticket-1', iat: Date.now() }, 'test-secret-min-32-chars-long-for-jwt!!');
      mockCheckInDirect.mockResolvedValue({ action: 'wrong_status', currentStatus: 'reserved' });

      await expect(checkinService.checkIn(qrToken, 'checker-1')).rejects.toMatchObject({
        statusCode: 409,
        code: 'TICKET_NOT_AVAILABLE',
        currentStatus: 'reserved',
      });
    });

    it('throws INVALID_QR when JWT is empty string', async () => {
      await expect(checkinService.checkIn('', 'checker-1')).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_QR',
      });
    });
  });
});
