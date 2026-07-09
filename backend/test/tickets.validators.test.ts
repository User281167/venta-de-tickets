import { describe, it, expect } from 'vitest';
import {
  createTicketSchema,
  updateTicketSchema,
  paginationSchema,
  paramsSchema,
  ticketTypeStatusSchema,
} from '../src/modules/tickets/tickets.validators.js';

describe('createTicketSchema', () => {
  const validPayload = {
    name: 'General',
    price: 50000,
    quantityTotal: 100,
  };

  it('accepts valid payload with required fields', () => {
    const result = createTicketSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('accepts payload with all optional fields', () => {
    const result = createTicketSchema.safeParse({
      ...validPayload,
      description: 'Standard entry',
      maxPerUser: 4,
      saleEndsAt: '2026-08-01T23:59:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createTicketSchema.safeParse({ ...validPayload, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const { name, ...rest } = validPayload;
    const result = createTicketSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects zero price', () => {
    const result = createTicketSchema.safeParse({ ...validPayload, price: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const result = createTicketSchema.safeParse({ ...validPayload, price: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects zero quantityTotal', () => {
    const result = createTicketSchema.safeParse({ ...validPayload, quantityTotal: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative quantityTotal', () => {
    const result = createTicketSchema.safeParse({ ...validPayload, quantityTotal: -5 });
    expect(result.success).toBe(false);
  });

  it('rejects maxPerUser less than 1', () => {
    const result = createTicketSchema.safeParse({ ...validPayload, maxPerUser: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects extra unknown fields', () => {
    const result = createTicketSchema.safeParse({ ...validPayload, extraField: 'xyz' });
    expect(result.success).toBe(false);
  });
});

describe('updateTicketSchema', () => {
  it('accepts partial update with name only', () => {
    const result = updateTicketSchema.safeParse({ name: 'VIP Plus' });
    expect(result.success).toBe(true);
  });

  it('accepts partial update with price only', () => {
    const result = updateTicketSchema.safeParse({ price: 75000 });
    expect(result.success).toBe(true);
  });

  it('accepts status change', () => {
    const result = updateTicketSchema.safeParse({ status: 'disabled' });
    expect(result.success).toBe(true);
  });

  it('accepts all fields', () => {
    const result = updateTicketSchema.safeParse({
      name: 'VIP',
      description: 'Updated desc',
      price: 100000,
      quantityTotal: 200,
      maxPerUser: 3,
      saleEndsAt: '2026-09-01T00:00:00.000Z',
      status: 'enabled',
    });
    expect(result.success).toBe(true);
  });

  it('accepts nullable fields set to null', () => {
    const result = updateTicketSchema.safeParse({
      description: null,
      maxPerUser: null,
      saleEndsAt: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = updateTicketSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const result = updateTicketSchema.safeParse({ price: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects zero quantityTotal', () => {
    const result = updateTicketSchema.safeParse({ quantityTotal: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = updateTicketSchema.safeParse({ status: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('rejects maxPerUser less than 1', () => {
    const result = updateTicketSchema.safeParse({ maxPerUser: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects empty object (no fields to update)', () => {
    const result = updateTicketSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('paginationSchema', () => {
  it('uses defaults when no query params', () => {
    const result = paginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it('accepts valid custom values', () => {
    const result = paginationSchema.parse({ page: '3', limit: '50' });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(50);
  });

  it('rejects page below 1', () => {
    const result = paginationSchema.safeParse({ page: '0' });
    expect(result.success).toBe(false);
  });

  it('rejects limit above 100', () => {
    const result = paginationSchema.safeParse({ limit: '200' });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer limit', () => {
    const result = paginationSchema.safeParse({ limit: 'abc' });
    expect(result.success).toBe(false);
  });
});

describe('paramsSchema', () => {
  it('accepts valid UUID', () => {
    const result = paramsSchema.safeParse({ id: '550e8400-e29b-41d4-a716-446655440000' });
    expect(result.success).toBe(true);
  });

  it('rejects non-UUID', () => {
    const result = paramsSchema.safeParse({ id: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects missing id', () => {
    const result = paramsSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('ticketTypeStatusSchema', () => {
  it('accepts enabled', () => {
    const result = ticketTypeStatusSchema.safeParse('enabled');
    expect(result.success).toBe(true);
  });

  it('accepts disabled', () => {
    const result = ticketTypeStatusSchema.safeParse('disabled');
    expect(result.success).toBe(true);
  });

  it('accepts blocked', () => {
    const result = ticketTypeStatusSchema.safeParse('blocked');
    expect(result.success).toBe(true);
  });

  it('rejects unknown status', () => {
    const result = ticketTypeStatusSchema.safeParse('unknown');
    expect(result.success).toBe(false);
  });
});
