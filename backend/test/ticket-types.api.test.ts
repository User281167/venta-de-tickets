import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

vi.mock('../src/shared/services/auth.service.js', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('../src/modules/ticket-types/ticket-types.repository.js', () => ({
  findAllPublishedEvents: vi.fn(),
  findEventById: vi.fn(),
  findAllActive: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));

const { verifyToken } = await import('../src/shared/services/auth.service.js');
const repo =
  await import('../src/modules/ticket-types/ticket-types.repository.js');

function authHeader(token = 'valid.jwt.token') {
  return { Authorization: `Bearer ${token}` };
}

const mockEvent = {
  id: 'evt-123',
  title: 'Future Minds 2026',
  description: 'El evento del año',
  eventDate: new Date('2026-07-15T20:00:00Z'),
  doorsOpenAt: new Date('2026-07-15T18:00:00Z'),
  saleEndsAt: null,
  location: 'Centro de Eventos, Medellín',
  prefix: 'FM26',
  status: 'published',
};

const mockTicketTypes = [
  {
    id: 'tt-1',
    name: 'General',
    description: 'Entrada general',
    price: 120000,
    quantityTotal: 500,
    quantitySold: 100,
    maxPerUser: 4,
    saleEndsAt: null,
  },
  {
    id: 'tt-2',
    name: 'VIP',
    description: 'Entrada VIP',
    price: 250000,
    quantityTotal: 50,
    quantitySold: 50,
    maxPerUser: 2,
    saleEndsAt: null,
  },
];

const mockAdminTicketTypes = [
  {
    id: 'tt-1',
    name: 'General',
    description: 'Entrada general',
    price: 120000,
    quantityTotal: 500,
    quantitySold: 100,
    maxPerUser: 4,
    isActive: true,
    saleEndsAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('GET /api/events (public listing)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty list when no events', async () => {
    vi.mocked(repo.findAllPublishedEvents).mockResolvedValue([]);

    const res = await request(app).get('/api/events');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns published events list', async () => {
    vi.mocked(repo.findAllPublishedEvents).mockResolvedValue([
      {
        id: 'evt-1',
        title: 'Future Minds 2026',
        description: 'Desc',
        eventDate: new Date(),
        location: 'Medellín',
        prefix: 'FM26',
      },
    ]);

    const res = await request(app).get('/api/events');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Future Minds 2026');
  });
});

describe('GET /api/events/:eventId (public detail)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 404 for non-existent event', async () => {
    vi.mocked(repo.findEventById).mockResolvedValue(null);

    const res = await request(app).get('/api/events/nonexistent-id');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns event with ticket types and availability', async () => {
    vi.mocked(repo.findEventById).mockResolvedValue(mockEvent);
    vi.mocked(repo.findAllActive).mockResolvedValue(mockTicketTypes);

    const res = await request(app).get('/api/events/evt-123');

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Future Minds 2026');
    expect(res.body.ticketTypes).toHaveLength(2);
    expect(res.body.ticketTypes[0].name).toBe('General');
    expect(res.body.ticketTypes[0].availableCount).toBe(400);
    expect(res.body.ticketTypes[0].isSoldOut).toBe(false);
    expect(res.body.ticketTypes[1].name).toBe('VIP');
    expect(res.body.ticketTypes[1].availableCount).toBe(0);
    expect(res.body.ticketTypes[1].isSoldOut).toBe(true);
  });
});

describe('GET /api/admin/:eventId/ticket-types', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      role: 'super_admin',
    });
  });

  it('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/admin/evt-123/ticket-types');
    expect(res.status).toBe(401);
  });

  it('returns 200 with ticket types for authorized admin', async () => {
    vi.mocked(repo.findAll).mockResolvedValue(mockAdminTicketTypes);

    const res = await request(app)
      .get('/api/admin/evt-123/ticket-types')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('General');
    expect(res.body.data[0].isActive).toBe(true);
  });

  it('returns 403 for checker role', async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'checker-1',
      email: 'checker@test.com',
      role: 'checker',
    });

    const res = await request(app)
      .get('/api/admin/evt-123/ticket-types')
      .set(authHeader());

    expect(res.status).toBe(403);
  });
});

describe('POST /api/admin/:eventId/ticket-types', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      role: 'super_admin',
    });
  });

  it('creates a ticket type with valid data', async () => {
    const newType = {
      id: 'tt-new',
      name: 'Early Bird',
      price: 80000,
      quantityTotal: 200,
      quantitySold: 0,
      isActive: true,
    };

    vi.mocked(repo.create).mockResolvedValue(newType);

    const res = await request(app)
      .post('/api/admin/evt-123/ticket-types')
      .set(authHeader())
      .send({ name: 'Early Bird', price: 80000, quantityTotal: 200 });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Early Bird');
  });

  it('returns 400 with missing required fields', async () => {
    const res = await request(app)
      .post('/api/admin/evt-123/ticket-types')
      .set(authHeader())
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 400 with negative price', async () => {
    const res = await request(app)
      .post('/api/admin/evt-123/ticket-types')
      .set(authHeader())
      .send({ name: 'Test', price: -100, quantityTotal: 10 });

    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/admin/ticket-types/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      role: 'super_admin',
    });
  });

  it('updates a ticket type with valid data', async () => {
    vi.mocked(repo.findById).mockResolvedValue(mockAdminTicketTypes[0]);
    vi.mocked(repo.update).mockResolvedValue({
      ...mockAdminTicketTypes[0],
      name: 'VIP Plus',
      price: 300000,
    });

    const res = await request(app)
      .patch('/api/admin/ticket-types/tt-1')
      .set(authHeader())
      .send({ name: 'VIP Plus', price: 300000 });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('VIP Plus');
  });

  it('returns 404 for non-existent ticket type', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/admin/ticket-types/nonexistent')
      .set(authHeader())
      .send({ name: 'New Name' });

    expect(res.status).toBe(404);
  });

  it('returns 400 with invalid data type for price', async () => {
    vi.mocked(repo.findById).mockResolvedValue(mockAdminTicketTypes[0]);

    const res = await request(app)
      .patch('/api/admin/ticket-types/tt-1')
      .set(authHeader())
      .send({ price: 'not-a-number' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/admin/ticket-types/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      role: 'super_admin',
    });
  });

  it('deactivates an active ticket type', async () => {
    vi.mocked(repo.findById).mockResolvedValue(mockAdminTicketTypes[0]);
    vi.mocked(repo.softDelete).mockResolvedValue({
      ...mockAdminTicketTypes[0],
      isActive: false,
    });

    const res = await request(app)
      .delete('/api/admin/ticket-types/tt-1')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Ticket type deactivated');
  });

  it('returns 404 for non-existent ticket type', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/admin/ticket-types/nonexistent')
      .set(authHeader());

    expect(res.status).toBe(404);
  });
});
