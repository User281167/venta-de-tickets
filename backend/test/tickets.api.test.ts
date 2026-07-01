import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

const mockPrisma = vi.hoisted(() => ({
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
  ticket: {
    count: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  ticketType: { findUnique: vi.fn(), update: vi.fn(), findMany: vi.fn() },
  event: { findMany: vi.fn(), findUnique: vi.fn() },
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  privacyAcceptance: { create: vi.fn(), findFirst: vi.fn() },
}));

vi.mock('../src/shared/database/prisma.client.js', () => ({
  prisma: mockPrisma,
}));

vi.mock('../src/shared/services/auth.service.js', () => ({
  verifyToken: vi.fn(),
}));

import { app } from '../src/app.js';

const { verifyToken } = await import('../src/shared/services/auth.service.js');

function authHeader(token = 'valid.jwt.token') {
  return { Authorization: `Bearer ${token}` };
}

describe('POST /api/tickets/reserve', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
      role: null,
    });
  });

  it('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/api/tickets/reserve')
      .send({ ticketTypeId: 'some-uuid', quantity: 1 });

    expect(res.status).toBe(401);
  });

  it('returns 400 with invalid body', async () => {
    const res = await request(app)
      .post('/api/tickets/reserve')
      .set(authHeader())
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 400 with quantity exceeding 4', async () => {
    const res = await request(app)
      .post('/api/tickets/reserve')
      .set(authHeader())
      .send({
        ticketTypeId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 5,
      });

    expect(res.status).toBe(400);
  });

  it('returns 400 with non-integer quantity', async () => {
    const res = await request(app)
      .post('/api/tickets/reserve')
      .set(authHeader())
      .send({
        ticketTypeId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 1.5,
      });

    expect(res.status).toBe(400);
  });

  it('returns 201 with valid reservation', async () => {
    mockPrisma.ticketType.findUnique.mockResolvedValue({
      id: 'tt-active',
      isActive: true,
      maxPerUser: 4,
      eventId: 'evt-123',
    });

    mockPrisma.$transaction.mockImplementation(
      async (cb: (tx: never) => unknown) => {
        return cb({
          $queryRaw: vi
            .fn()
            .mockResolvedValueOnce([
              { quantity_total: 500, quantity_sold: 100 },
            ])
            .mockResolvedValueOnce([{ prefix: 'FM26' }])
            .mockResolvedValueOnce([{ nextval: 42 }])
            .mockResolvedValueOnce([{ nextval: 43 }]),
          ticket: {
            count: vi.fn().mockResolvedValue(0),
            create: vi
              .fn()
              .mockResolvedValueOnce({
                id: 'ticket-1',
                ticketCode: 'FM26-0042',
                ticketTypeId: 'tt-active',
                status: 'reserved',
              })
              .mockResolvedValueOnce({
                id: 'ticket-2',
                ticketCode: 'FM26-0043',
                ticketTypeId: 'tt-active',
                status: 'reserved',
              }),
          },
          ticketType: { update: vi.fn() },
        } as never);
      },
    );

    const res = await request(app)
      .post('/api/tickets/reserve')
      .set(authHeader())
      .send({
        ticketTypeId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.reservation).toBeDefined();
    expect(res.body.reservation.tickets).toHaveLength(2);
    expect(res.body.reservation.tickets[0].ticketCode).toBe('FM26-0042');
    expect(res.body.reservation.tickets[0].qrToken).toBeDefined();
    expect(res.body.reservation.tickets[0].status).toBe('reserved');
  });

  it('returns 404 for non-existent ticket type', async () => {
    mockPrisma.ticketType.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/tickets/reserve')
      .set(authHeader())
      .send({
        ticketTypeId: '00000000-0000-0000-0000-000000000000',
        quantity: 1,
      });

    expect(res.status).toBe(404);
  });

  it('returns 409 for inactive ticket type', async () => {
    mockPrisma.ticketType.findUnique.mockResolvedValue({
      id: 'tt-inactive',
      isActive: false,
      maxPerUser: 4,
      eventId: 'evt-123',
    });

    const res = await request(app)
      .post('/api/tickets/reserve')
      .set(authHeader())
      .send({
        ticketTypeId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 1,
      });

    expect(res.status).toBe(409);
  });

  it('returns 409 when quantity exceeds maxPerUser', async () => {
    mockPrisma.ticketType.findUnique.mockResolvedValue({
      id: 'tt-limited',
      isActive: true,
      maxPerUser: 2,
      eventId: 'evt-123',
    });

    const res = await request(app)
      .post('/api/tickets/reserve')
      .set(authHeader())
      .send({
        ticketTypeId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 3,
      });

    expect(res.status).toBe(409);
  });

  it('returns 409 when insufficient availability', async () => {
    mockPrisma.ticketType.findUnique.mockResolvedValue({
      id: 'tt-active',
      isActive: true,
      maxPerUser: 4,
      eventId: 'evt-123',
    });

    mockPrisma.$transaction.mockImplementation(
      async (cb: (tx: never) => unknown) => {
        return cb({
          $queryRaw: vi
            .fn()
            .mockResolvedValue([{ quantity_total: 10, quantity_sold: 10 }]),
          ticket: { count: vi.fn() },
          ticketType: { update: vi.fn() },
        } as never);
      },
    );

    const res = await request(app)
      .post('/api/tickets/reserve')
      .set(authHeader())
      .send({
        ticketTypeId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 1,
      });

    expect(res.status).toBe(409);
  });

  it('returns 409 when user already has reservation', async () => {
    mockPrisma.ticketType.findUnique.mockResolvedValue({
      id: 'tt-active',
      isActive: true,
      maxPerUser: 4,
      eventId: 'evt-123',
    });

    mockPrisma.$transaction.mockImplementation(
      async (cb: (tx: never) => unknown) => {
        return cb({
          $queryRaw: vi
            .fn()
            .mockResolvedValue([{ quantity_total: 500, quantity_sold: 100 }]),
          ticket: { count: vi.fn().mockResolvedValue(1) },
          ticketType: { update: vi.fn() },
        } as never);
      },
    );

    const res = await request(app)
      .post('/api/tickets/reserve')
      .set(authHeader())
      .send({
        ticketTypeId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 1,
      });

    expect(res.status).toBe(409);
  });
});

describe('GET /api/tickets/my-reservations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
      role: null,
    });
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/tickets/my-reservations');

    expect(res.status).toBe(401);
  });

  it('returns empty list when no reservations', async () => {
    mockPrisma.ticket.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/tickets/my-reservations')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.tickets).toEqual([]);
  });

  it('returns user reservations', async () => {
    mockPrisma.ticket.findMany.mockResolvedValue([
      {
        id: 'ticket-1',
        ticketCode: 'FM26-0042',
        status: 'reserved',
        reserveExpiresAt: new Date().toISOString(),
        ticketType: { id: 'tt-1', name: 'General' },
        event: { id: 'evt-1', title: 'Future Minds 2026' },
      },
      {
        id: 'ticket-2',
        ticketCode: 'FM26-0043',
        status: 'reserved',
        reserveExpiresAt: new Date().toISOString(),
        ticketType: { id: 'tt-1', name: 'General' },
        event: { id: 'evt-1', title: 'Future Minds 2026' },
      },
    ]);

    const res = await request(app)
      .get('/api/tickets/my-reservations')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.tickets).toHaveLength(2);
    expect(res.body.tickets[0].ticketCode).toBe('FM26-0042');
  });
});
