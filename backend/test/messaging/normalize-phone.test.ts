import { describe, expect, it } from 'vitest';
import { normalizePhoneNumber } from '../../src/modules/messaging/utils/normalize-phone.js';

describe('normalizePhoneNumber', () => {
  it('strips spaces, dashes, parens, and dots', () => {
    expect(normalizePhoneNumber('(300) 123-4567')).toBe('+573001234567');
    expect(normalizePhoneNumber('300 123 4567')).toBe('+573001234567');
    expect(normalizePhoneNumber('300.123.4567')).toBe('+573001234567');
  });

  it('trims leading/trailing whitespace', () => {
    expect(normalizePhoneNumber('  3001234567  ')).toBe('+573001234567');
  });

  it('prepends +57 to 10-digit numbers starting with 3', () => {
    expect(normalizePhoneNumber('3001234567')).toBe('+573001234567');
  });

  it('prepends + to 12-digit numbers already starting with 57', () => {
    expect(normalizePhoneNumber('573001234567')).toBe('+573001234567');
  });

  it('keeps explicit +57 prefix untouched', () => {
    expect(normalizePhoneNumber('+573001234567')).toBe('+573001234567');
  });

  it.each([
    '+1234567890',
    '1234567',
    'abc123',
    '57300123456',
    '+5730012345678',
    '',
  ])('throws on invalid phone %s', (bad) => {
    expect(() => normalizePhoneNumber(bad)).toThrow(/Invalid Colombian phone/);
  });
});