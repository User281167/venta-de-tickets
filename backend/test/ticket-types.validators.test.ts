import { describe, it, expect } from 'vitest';
import {
  eventIdParamSchema,
  createTicketTypeSchema,
  updateTicketTypeSchema,
} from '../src/modules/ticket-types/ticket-types.validators.js';

describe('eventIdParamSchema', () => {
  it('accepts valid UUID eventId', () => {
    const result = eventIdParamSchema.safeParse({
      eventId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-UUID eventId', () => {
    const result = eventIdParamSchema.safeParse({ eventId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects missing eventId', () => {
    const result = eventIdParamSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('createTicketTypeSchema', () => {
  const validPayload = {
    name: 'General',
    price: 120000,
    quantityTotal: 500,
  };

  it('accepts valid payload with required fields only', () => {
    const result = createTicketTypeSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('General');
      expect(result.data.price).toBe(120000);
      expect(result.data.quantityTotal).toBe(500);
    }
  });

  it('accepts payload with all optional fields', () => {
    const result = createTicketTypeSchema.safeParse({
      ...validPayload,
      description: 'Entrada general al evento',
      maxPerUser: 4,
      saleEndsAt: '2026-07-30T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('Entrada general al evento');
      expect(result.data.maxPerUser).toBe(4);
    }
  });

  it('rejects empty name', () => {
    const result = createTicketTypeSchema.safeParse({
      ...validPayload,
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects name longer than 100 chars', () => {
    const result = createTicketTypeSchema.safeParse({
      ...validPayload,
      name: 'x'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero price', () => {
    const result = createTicketTypeSchema.safeParse({
      ...validPayload,
      price: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const result = createTicketTypeSchema.safeParse({
      ...validPayload,
      price: -100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer quantityTotal', () => {
    const result = createTicketTypeSchema.safeParse({
      ...validPayload,
      quantityTotal: 10.5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero quantityTotal', () => {
    const result = createTicketTypeSchema.safeParse({
      ...validPayload,
      quantityTotal: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects maxPerUser less than 1', () => {
    const result = createTicketTypeSchema.safeParse({
      ...validPayload,
      maxPerUser: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid saleEndsAt format', () => {
    const result = createTicketTypeSchema.safeParse({
      ...validPayload,
      saleEndsAt: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const result = createTicketTypeSchema.safeParse({
      price: 120000,
      quantityTotal: 500,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing price', () => {
    const result = createTicketTypeSchema.safeParse({
      name: 'General',
      quantityTotal: 500,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing quantityTotal', () => {
    const result = createTicketTypeSchema.safeParse({
      name: 'General',
      price: 120000,
    });
    expect(result.success).toBe(false);
  });
});

describe('updateTicketTypeSchema', () => {
  it('accepts partial update with name only', () => {
    const result = updateTicketTypeSchema.safeParse({ name: 'VIP Plus' });
    expect(result.success).toBe(true);
  });

  it('accepts partial update with price only', () => {
    const result = updateTicketTypeSchema.safeParse({ price: 300000 });
    expect(result.success).toBe(true);
  });

  it('accepts full update with all fields', () => {
    const result = updateTicketTypeSchema.safeParse({
      name: 'VIP Plus',
      description: 'Updated description',
      price: 300000,
      quantityTotal: 150,
      maxPerUser: 3,
      isActive: false,
      saleEndsAt: '2026-08-01T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('accepts saleEndsAt set to null (clear date)', () => {
    const result = updateTicketTypeSchema.safeParse({ saleEndsAt: null });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = updateTicketTypeSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const result = updateTicketTypeSchema.safeParse({ price: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer quantityTotal', () => {
    const result = updateTicketTypeSchema.safeParse({ quantityTotal: 10.5 });
    expect(result.success).toBe(false);
  });

  it('rejects maxPerUser less than 1', () => {
    const result = updateTicketTypeSchema.safeParse({ maxPerUser: 0 });
    expect(result.success).toBe(false);
  });

  it('accepts empty object (no changes)', () => {
    const result = updateTicketTypeSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
