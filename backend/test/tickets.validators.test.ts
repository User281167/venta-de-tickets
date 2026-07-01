import { describe, it, expect } from 'vitest';
import { reserveTicketSchema } from '../src/modules/tickets/tickets.validators.js';

describe('reserveTicketSchema', () => {
  it('accepts valid reservation data', () => {
    const result = reserveTicketSchema.parse({
      ticketTypeId: '123e4567-e89b-12d3-a456-426614174000',
      quantity: 2,
    });

    expect(result.ticketTypeId).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(result.quantity).toBe(2);
  });

  it('accepts minimum quantity of 1', () => {
    const result = reserveTicketSchema.parse({
      ticketTypeId: '123e4567-e89b-12d3-a456-426614174000',
      quantity: 1,
    });

    expect(result.quantity).toBe(1);
  });

  it('accepts maximum quantity of 4', () => {
    const result = reserveTicketSchema.parse({
      ticketTypeId: '123e4567-e89b-12d3-a456-426614174000',
      quantity: 4,
    });

    expect(result.quantity).toBe(4);
  });

  it('rejects quantity of 0', () => {
    expect(() =>
      reserveTicketSchema.parse({
        ticketTypeId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 0,
      }),
    ).toThrow();
  });

  it('rejects negative quantity', () => {
    expect(() =>
      reserveTicketSchema.parse({
        ticketTypeId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: -1,
      }),
    ).toThrow();
  });

  it('rejects quantity exceeding 4', () => {
    expect(() =>
      reserveTicketSchema.parse({
        ticketTypeId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 5,
      }),
    ).toThrow();
  });

  it('rejects non-integer quantity', () => {
    expect(() =>
      reserveTicketSchema.parse({
        ticketTypeId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 1.5,
      }),
    ).toThrow();
  });

  it('rejects invalid uuid for ticketTypeId', () => {
    expect(() =>
      reserveTicketSchema.parse({
        ticketTypeId: 'not-a-uuid',
        quantity: 1,
      }),
    ).toThrow();
  });

  it('rejects missing ticketTypeId', () => {
    expect(() => reserveTicketSchema.parse({ quantity: 1 })).toThrow();
  });

  it('rejects missing quantity', () => {
    expect(() =>
      reserveTicketSchema.parse({
        ticketTypeId: '123e4567-e89b-12d3-a456-426614174000',
      }),
    ).toThrow();
  });

  it('rejects empty body', () => {
    expect(() => reserveTicketSchema.parse({})).toThrow();
  });
});
