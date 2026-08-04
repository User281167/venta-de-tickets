import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

vi.mock('../../src/shared/services/auth.service.js', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('../../src/modules/users/users.service.js', () => ({
  getUserAuthInfo: vi.fn(),
}));

vi.mock('../../src/modules/donaciones/donaciones.repository.js', () => ({
  findAllAdmin: vi.fn(),
  findById: vi.fn(),
  expirePending: vi.fn(),
  create: vi.fn(),
  findByExternalReference: vi.fn(),
  updateStateByExternalReference: vi.fn(),
  createDonationUUID: vi.fn(),
  donationRepository: {
    findAllAdmin: vi.fn(),
    findById: vi.fn(),
    expirePending: vi.fn(),
    create: vi.fn(),
    findByExternalReference: vi.fn(),
    updateStateByExternalReference: vi.fn(),
  },
}));

const { verifyToken } = await import('../../src/shared/services/auth.service.js');
const { getUserAuthInfo } = await import('../../src/modules/users/users.service.js');
const repo = await import('../../src/modules/donaciones/donaciones.repository.js');
const donationRepositoryMock = repo.donationRepository;

function authHeader() {
  return { Authorization: 'Bearer valid.jwt.token' };
}

function mockAdminAuth(role: 'admin' | 'super_admin' = 'admin') {
  vi.mocked(getUserAuthInfo).mockResolvedValue({ role, isActive: true });
  vi.mocked(verifyToken).mockResolvedValue({
    id: `${role}-1`,
    email: `${role}@test.com`,
    role,
  });
}

describe('GET /api/admin/donations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/admin/donations');
    expect(res.status).toBe(401);
  });

  it('returns paginated donations for an admin', async () => {
    mockAdminAuth('admin');
    vi.mocked(donationRepositoryMock.findAllAdmin).mockResolvedValue({
      data: [
        {
          id: 'don-1',
          full_name: 'Ana',
          email: 'ana@test.com',
          amountCents: 50000,
          state: 'confirmed',
          account: 'LA_CONVENCION',
          externalReference: 'DON-LA_CONVENCION-uuid',
          paymentId: 'mp-1',
          createdAt: new Date('2026-07-30T12:00:00.000Z'),
          updatedAt: new Date('2026-07-30T12:05:00.000Z'),
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
    });

    const res = await request(app)
      .get('/api/admin/donations')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      total: 1,
      page: 1,
      limit: 50,
    });
    expect(res.body.data[0]).toMatchObject({
      id: 'don-1',
      fullName: 'Ana',
      email: 'ana@test.com',
      amountCents: 50000,
      state: 'confirmed',
      account: 'LA_CONVENCION',
    });
    expect(res.body.data[0].createdAt).toBe('2026-07-30T12:00:00.000Z');
    expect(donationRepositoryMock.findAllAdmin).toHaveBeenCalledWith({
      page: 1,
      limit: 50,
      state: undefined,
      account: undefined,
      search: undefined,
    });
  });

  it('forwards query filters to the repository', async () => {
    mockAdminAuth('super_admin');
    vi.mocked(donationRepositoryMock.findAllAdmin).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 25,
    });

    const res = await request(app)
      .get('/api/admin/donations')
      .query({ state: 'confirmed', account: 'LA_CONVENCION', page: 1, limit: 25, search: 'ana' })
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(donationRepositoryMock.findAllAdmin).toHaveBeenCalledWith({
      page: 1,
      limit: 25,
      state: 'confirmed',
      account: 'LA_CONVENCION',
      search: 'ana',
    });
  });

  it('rejects an invalid state filter with 422', async () => {
    mockAdminAuth('admin');

    const res = await request(app)
      .get('/api/admin/donations')
      .query({ state: 'not-a-state' })
      .set(authHeader());

    expect(res.status).toBe(422);
  });

  it('rejects an invalid account filter with 422', async () => {
    mockAdminAuth('admin');

    const res = await request(app)
      .get('/api/admin/donations')
      .query({ account: 'BOGUS_ACCOUNT' })
      .set(authHeader());

    expect(res.status).toBe(422);
  });

  it('rejects limit above 100 with 422', async () => {
    mockAdminAuth('admin');

    const res = await request(app)
      .get('/api/admin/donations')
      .query({ limit: '500' })
      .set(authHeader());

    expect(res.status).toBe(422);
    expect(donationRepositoryMock.findAllAdmin).not.toHaveBeenCalled();
  });
});
