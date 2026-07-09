import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

vi.mock('../src/modules/tickets/tickets.service.js', () => ({
  listTicketTypes: vi.fn(),
  getTicketTypeById: vi.fn(),
  listAllTicketTypes: vi.fn(),
  createTicketType: vi.fn(),
  updateTicketType: vi.fn(),
}));

const service = await import('../src/modules/tickets/tickets.service.js');
const ctrl = await import('../src/modules/tickets/tickets.controller.js');

function mockReq(overrides: Record<string, unknown> = {}): Request {
  return {
    query: {},
    params: {},
    body: {},
    ...overrides,
  } as unknown as Request;
}

function mockRes(): Response {
  const res: Record<string, any> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as unknown as Response;
}

describe('list', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 with paginated data', async () => {
    const req = mockReq({ query: { page: '1', limit: '20' } });
    const res = mockRes();
    const paginatedResult = { data: [], total: 0, page: 1, limit: 20 };

    vi.mocked(service.listTicketTypes).mockResolvedValue(paginatedResult);

    await ctrl.list(req, res);

    expect(res.json).toHaveBeenCalledWith(paginatedResult);
  });

  it('returns 422 with invalid query params', async () => {
    const req = mockReq({ query: { page: '0' } });
    const res = mockRes();

    await ctrl.list(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ code: 'VALIDATION_ERROR' }) }),
    );
  });
});

describe('getById', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 with ticket type', async () => {
    const req = mockReq({ params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const res = mockRes();
    const ticket = { id: req.params.id, name: 'General' };

    vi.mocked(service.getTicketTypeById).mockResolvedValue(ticket);

    await ctrl.getById(req, res);

    expect(res.json).toHaveBeenCalledWith(ticket);
  });

  it('returns 422 with invalid UUID param', async () => {
    const req = mockReq({ params: { id: 'not-a-uuid' } });
    const res = mockRes();

    await ctrl.getById(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
  });
});

describe('adminList', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 with all ticket types including blocked', async () => {
    const req = mockReq({ query: { page: '1', limit: '20' } });
    const res = mockRes();
    const result = { data: [], total: 0, page: 1, limit: 20 };

    vi.mocked(service.listAllTicketTypes).mockResolvedValue(result);

    await ctrl.adminList(req, res);

    expect(res.json).toHaveBeenCalledWith(result);
  });
});

describe('create', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with created ticket type', async () => {
    const req = mockReq({ body: { name: 'General', price: 50000, quantityTotal: 100 } });
    const res = mockRes();
    const created = { id: 'new-uuid', name: 'General', status: 'enabled' };

    vi.mocked(service.createTicketType).mockResolvedValue(created);

    await ctrl.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });

  it('returns 422 with invalid body', async () => {
    const req = mockReq({ body: { price: -100 } });
    const res = mockRes();

    await ctrl.create(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ code: 'VALIDATION_ERROR' }) }),
    );
  });

  it('returns 422 with missing required fields', async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();

    await ctrl.create(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
  });
});

describe('update', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 with updated ticket type', async () => {
    const req = mockReq({
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      body: { name: 'VIP' },
    });
    const res = mockRes();
    const updated = { id: req.params.id, name: 'VIP' };

    vi.mocked(service.updateTicketType).mockResolvedValue(updated);

    await ctrl.update(req, res);

    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('returns 422 with invalid UUID param', async () => {
    const req = mockReq({ params: { id: 'bad-id' }, body: { name: 'VIP' } });
    const res = mockRes();

    await ctrl.update(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('returns 422 with invalid body', async () => {
    const req = mockReq({
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      body: { status: 'bogus' },
    });
    const res = mockRes();

    await ctrl.update(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('returns 422 with empty body', async () => {
    const req = mockReq({
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      body: {},
    });
    const res = mockRes();

    await ctrl.update(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
  });
});
