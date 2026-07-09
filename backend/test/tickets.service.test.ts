import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError } from '../src/shared/errors/NotFoundError.js';
import { ValidationError } from '../src/shared/errors/ValidationError.js';

vi.mock('../src/modules/tickets/tickets.repository.js', () => ({
  findAllPublic: vi.fn(),
  countPublic: vi.fn(),
  findAllAdmin: vi.fn(),
  countAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}));

const repo = await import('../src/modules/tickets/tickets.repository.js');
const service = await import('../src/modules/tickets/tickets.service.js');

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

describe('listTicketTypes', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns paginated public ticket types (no blocked)', async () => {
    vi.mocked(repo.findAllPublic).mockResolvedValue([mockTicketType]);
    vi.mocked(repo.countPublic).mockResolvedValue(1);

    const result = await service.listTicketTypes(1, 20);

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(repo.findAllPublic).toHaveBeenCalledWith(1, 20);
    expect(repo.countPublic).toHaveBeenCalled();
  });

  it('returns empty array when no ticket types', async () => {
    vi.mocked(repo.findAllPublic).mockResolvedValue([]);
    vi.mocked(repo.countPublic).mockResolvedValue(0);

    const result = await service.listTicketTypes(1, 20);

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe('getTicketTypeById', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns ticket type when found', async () => {
    vi.mocked(repo.findById).mockResolvedValue(mockTicketType);

    const result = await service.getTicketTypeById(mockTicketType.id);

    expect(result.id).toBe(mockTicketType.id);
    expect(result.name).toBe('General');
  });

  it('throws NotFoundError when not found', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);

    await expect(service.getTicketTypeById('nonexistent')).rejects.toThrow(NotFoundError);
  });
});

describe('listAllTicketTypes', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns all ticket types including blocked', async () => {
    const blockedType = { ...mockTicketType, id: 'blocked-uuid', status: 'blocked' };
    vi.mocked(repo.findAllAdmin).mockResolvedValue([mockTicketType, blockedType]);
    vi.mocked(repo.countAll).mockResolvedValue(2);

    const result = await service.listAllTicketTypes(1, 20);

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(repo.findAllAdmin).toHaveBeenCalledWith(1, 20);
  });
});

describe('createTicketType', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('creates ticket type with status enabled', async () => {
    vi.mocked(repo.create).mockResolvedValue(mockTicketType);

    const result = await service.createTicketType({
      name: 'General',
      price: 50000,
      quantityTotal: 100,
    });

    expect(result.status).toBe('enabled');
    expect(repo.create).toHaveBeenCalledWith({
      name: 'General',
      price: 50000,
      quantityTotal: 100,
      description: undefined,
      maxPerUser: undefined,
      saleEndsAt: undefined,
    });
  });
});

describe('updateTicketType', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('updates ticket type fields successfully', async () => {
    vi.mocked(repo.findById).mockResolvedValue(mockTicketType);
    vi.mocked(repo.update).mockResolvedValue({ ...mockTicketType, name: 'VIP' });

    const result = await service.updateTicketType(mockTicketType.id, { name: 'VIP' });

    expect(result.name).toBe('VIP');
    expect(repo.findById).toHaveBeenCalledWith(mockTicketType.id);
  });

  it('throws NotFoundError when ticket type not found', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);

    await expect(
      service.updateTicketType('nonexistent', { name: 'VIP' }),
    ).rejects.toThrow(NotFoundError);
  });

  it('updates status successfully', async () => {
    vi.mocked(repo.findById).mockResolvedValue(mockTicketType);
    vi.mocked(repo.update).mockResolvedValue({ ...mockTicketType, status: 'disabled' });

    const result = await service.updateTicketType(mockTicketType.id, { status: 'disabled' });

    expect(result.status).toBe('disabled');
  });

  it('rejects quantityTotal lower than quantitySold', async () => {
    vi.mocked(repo.findById).mockResolvedValue(mockTicketType);

    await expect(
      service.updateTicketType(mockTicketType.id, { quantityTotal: 10 }),
    ).rejects.toThrow(ValidationError);
  });

  it('accepts quantityTotal higher than quantitySold', async () => {
    vi.mocked(repo.findById).mockResolvedValue(mockTicketType);
    vi.mocked(repo.update).mockResolvedValue({ ...mockTicketType, quantityTotal: 200 });

    const result = await service.updateTicketType(mockTicketType.id, { quantityTotal: 200 });

    expect(result.quantityTotal).toBe(200);
  });

  it('accepts quantityTotal equal to quantitySold', async () => {
    vi.mocked(repo.findById).mockResolvedValue(mockTicketType);
    vi.mocked(repo.update).mockResolvedValue({ ...mockTicketType, quantityTotal: 30 });

    const result = await service.updateTicketType(mockTicketType.id, { quantityTotal: 30 });

    expect(result.quantityTotal).toBe(30);
  });
});
