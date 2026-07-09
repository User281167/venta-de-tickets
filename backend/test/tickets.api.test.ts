import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

const mockPrisma = vi.hoisted(() => ({
  ticketType: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
}));

vi.mock('../src/shared/database/prisma.client.js', () => ({
  prisma: mockPrisma,
}));

vi.mock('../src/shared/services/auth.service.js', () => ({
  verifyToken: vi.fn(),
}));

import { app } from '../src/app.js';

const { verifyToken } = await import('../src/shared/services/auth.service.js');

function authHeader(token = 'admin.jwt.token') {
  return { Authorization: `Bearer ${token}` };
}

const mockTicketType = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'General',
  description: 'Standard entry',
  price: 50000,
  quantityTotal: 100,
  quantitySold: 30,
  maxPerUser: 4,
  saleEndsAt: null,
  status: 'enabled',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-01T00:00:00.000Z',
};

describe('GET /api/tickets (public list)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 with paginated list of ticket types', async () => {
    mockPrisma.ticketType.findMany.mockResolvedValue([mockTicketType]);
    mockPrisma.ticketType.count.mockResolvedValue(1);

    const res = await request(app).get('/api/tickets');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('General');
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(20);
  });

  it('returns 200 with empty list when no tickets', async () => {
    mockPrisma.ticketType.findMany.mockResolvedValue([]);
    mockPrisma.ticketType.count.mockResolvedValue(0);

    const res = await request(app).get('/api/tickets');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  it('returns 200 without auth (public endpoint)', async () => {
    mockPrisma.ticketType.findMany.mockResolvedValue([]);
    mockPrisma.ticketType.count.mockResolvedValue(0);

    const res = await request(app).get('/api/tickets');

    expect(res.status).toBe(200);
  });

  it('returns 422 with invalid pagination params', async () => {
    const res = await request(app).get('/api/tickets?page=0');

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 with limit exceeding max', async () => {
    const res = await request(app).get('/api/tickets?limit=200');

    expect(res.status).toBe(422);
  });
});

describe('GET /api/tickets/:id (public get by ID)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 with ticket type', async () => {
    mockPrisma.ticketType.findUnique.mockResolvedValue(mockTicketType);

    const res = await request(app).get(`/api/tickets/${mockTicketType.id}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('General');
  });

  it('returns 404 for non-existent ticket type', async () => {
    mockPrisma.ticketType.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/tickets/550e8400-e29b-41d4-a716-446655440001');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 422 with invalid UUID', async () => {
    const res = await request(app).get('/api/tickets/not-a-uuid');

    expect(res.status).toBe(422);
  });

  it('returns data for blocked ticket type when fetched by ID', async () => {
    const blockedTicket = { ...mockTicketType, status: 'blocked' };
    mockPrisma.ticketType.findUnique.mockResolvedValue(blockedTicket);

    const res = await request(app).get(`/api/tickets/${mockTicketType.id}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('blocked');
  });
});

describe('POST /api/admin/tickets (admin create)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      role: 'admin',
    });
  });

  it('returns 201 with created ticket type', async () => {
    mockPrisma.ticketType.create.mockResolvedValue(mockTicketType);

    const res = await request(app)
      .post('/api/admin/tickets')
      .set(authHeader())
      .send({ name: 'General', price: 50000, quantityTotal: 100 });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('General');
  });

  it('returns 401 without auth header', async () => {
    const res = await request(app)
      .post('/api/admin/tickets')
      .send({ name: 'General', price: 50000, quantityTotal: 100 });

    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin role', async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
      role: 'client',
    });

    const res = await request(app)
      .post('/api/admin/tickets')
      .set(authHeader('user.jwt.token'))
      .send({ name: 'General', price: 50000, quantityTotal: 100 });

    expect(res.status).toBe(403);
  });

  it('returns 422 with missing required fields', async () => {
    const res = await request(app)
      .post('/api/admin/tickets')
      .set(authHeader())
      .send({});

    expect(res.status).toBe(422);
  });

  it('returns 422 with negative price', async () => {
    const res = await request(app)
      .post('/api/admin/tickets')
      .set(authHeader())
      .send({ name: 'Test', price: -100, quantityTotal: 10 });

    expect(res.status).toBe(422);
  });

  it('returns 422 with zero quantityTotal', async () => {
    const res = await request(app)
      .post('/api/admin/tickets')
      .set(authHeader())
      .send({ name: 'Test', price: 100, quantityTotal: 0 });

    expect(res.status).toBe(422);
  });
});

describe('PATCH /api/admin/tickets/:id (admin update)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      role: 'admin',
    });
  });

  it('returns 200 with updated ticket type', async () => {
    mockPrisma.ticketType.findUnique.mockResolvedValue(mockTicketType);
    mockPrisma.ticketType.update.mockResolvedValue({ ...mockTicketType, name: 'VIP' });

    const res = await request(app)
      .patch(`/api/admin/tickets/${mockTicketType.id}`)
      .set(authHeader())
      .send({ name: 'VIP' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('VIP');
  });

  it('returns 404 for non-existent ticket type', async () => {
    mockPrisma.ticketType.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/admin/tickets/550e8400-e29b-41d4-a716-446655440001')
      .set(authHeader())
      .send({ name: 'VIP' });

    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app)
      .patch(`/api/admin/tickets/${mockTicketType.id}`)
      .send({ name: 'VIP' });

    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin role', async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
      role: 'client',
    });

    const res = await request(app)
      .patch(`/api/admin/tickets/${mockTicketType.id}`)
      .set(authHeader('user.jwt.token'))
      .send({ name: 'VIP' });

    expect(res.status).toBe(403);
  });

  it('returns 422 with invalid UUID param', async () => {
    const res = await request(app)
      .patch('/api/admin/tickets/not-a-uuid')
      .set(authHeader())
      .send({ name: 'VIP' });

    expect(res.status).toBe(422);
  });

  it('returns 422 with empty body', async () => {
    const res = await request(app)
      .patch(`/api/admin/tickets/${mockTicketType.id}`)
      .set(authHeader())
      .send({});

    expect(res.status).toBe(422);
  });

  it('returns 422 when quantityTotal lower than quantitySold', async () => {
    mockPrisma.ticketType.findUnique.mockResolvedValue(mockTicketType);

    const res = await request(app)
      .patch(`/api/admin/tickets/${mockTicketType.id}`)
      .set(authHeader())
      .send({ quantityTotal: 10 });

    expect(res.status).toBe(422);
    expect(res.body.error.message).toContain('Cannot be lower than current sold tickets');
  });

  it('returns 200 when updating status via PATCH', async () => {
    mockPrisma.ticketType.findUnique.mockResolvedValue(mockTicketType);
    mockPrisma.ticketType.update.mockResolvedValue({ ...mockTicketType, status: 'disabled' });

    const res = await request(app)
      .patch(`/api/admin/tickets/${mockTicketType.id}`)
      .set(authHeader())
      .send({ status: 'disabled' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('disabled');
  });

  it('returns 422 with invalid status value', async () => {
    const res = await request(app)
      .patch(`/api/admin/tickets/${mockTicketType.id}`)
      .set(authHeader())
      .send({ status: 'invalid' });

    expect(res.status).toBe(422);
  });
});

describe('GET /api/admin/tickets (admin list all)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      role: 'admin',
    });
  });

  it('returns 200 with all statuses including blocked', async () => {
    const blockedTicket = { ...mockTicketType, id: 'blocked-uuid', status: 'blocked' };
    mockPrisma.ticketType.findMany.mockResolvedValue([mockTicketType, blockedTicket]);
    mockPrisma.ticketType.count.mockResolvedValue(2);

    const res = await request(app)
      .get('/api/admin/tickets')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/admin/tickets');

    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin', async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
      role: 'client',
    });

    const res = await request(app)
      .get('/api/admin/tickets')
      .set(authHeader('user.jwt.token'));

    expect(res.status).toBe(403);
  });
});
