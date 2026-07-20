import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

vi.mock('../src/shared/services/auth.service.js', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('../src/shared/services/role-resolver.js', () => ({
  resolveRole: vi.fn(),
}));

vi.mock('../src/modules/me/me.repository.js', () => ({
  findByUserId: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock('../src/modules/payments/payments.repository.js', () => ({
  findAllByUserId: vi.fn(),
  countByUserId: vi.fn(),
}));

vi.mock('../src/modules/users/users.service.js', () => ({
  getPrivacyStatus: vi.fn(),
}));

const { verifyToken } = await import('../src/shared/services/auth.service.js');
const { resolveRole } = await import('../src/shared/services/role-resolver.js');
const { getPrivacyStatus } = await import('../src/modules/users/users.service.js');

const meRepo = await import('../src/modules/me/me.repository.js');
const paymentsRepo = await import('../src/modules/payments/payments.repository.js');

function authHeader(token = 'valid.jwt.token') {
  return { Authorization: `Bearer ${token}` };
}

function mockClientAuth() {
  vi.mocked(resolveRole).mockResolvedValue('client');
  vi.mocked(verifyToken).mockResolvedValue({
    id: 'user-123',
    email: 'test@example.com',
    role: 'client',
  });
}

function mockNonClientAuth(role: string) {
  vi.mocked(resolveRole).mockResolvedValue(role);
  vi.mocked(verifyToken).mockResolvedValue({
    id: 'user-123',
    email: 'test@example.com',
    role,
  });
}

const mockPersonalInfo = {
  cedula: '123456789',
  fullName: 'Juan Pérez',
  phone: '3001234567',
  address: 'Calle 123',
  dateOfBirth: '1990-01-15',
};

const mockNullInfo = {
  cedula: null,
  fullName: null,
  phone: null,
  address: null,
  dateOfBirth: null,
};

describe('GET /api/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClientAuth();
  });

  it('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with malformed header', async () => {
    const res = await request(app)
      .get('/api/me')
      .set('Authorization', 'Basic token');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid/expired token', async () => {
    vi.mocked(verifyToken).mockRejectedValueOnce(
      new (
        await import('../src/shared/errors/UnauthorizedError.js')
      ).UnauthorizedError('Invalid or expired token'),
    );

    const res = await request(app).get('/api/me').set(authHeader('bad-token'));
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 200 with user object when valid token provided', async () => {
    vi.mocked(getPrivacyStatus).mockResolvedValue({
      consentStatus: {
        required: true,
        acceptedAt: null,
        policyVersion: '1.0',
      },
    });

    const res = await request(app).get('/api/me').set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      id: 'user-123',
      email: 'test@example.com',
    });
    expect(res.body.consentStatus).toMatchObject({
      required: true,
      acceptedAt: null,
      policyVersion: '1.0',
    });
  });
});

describe('GET /api/me/personal-info', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClientAuth();
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/me/personal-info');
    expect(res.status).toBe(401);
  });

  it('returns 200 with user data when user exists', async () => {
    vi.mocked(meRepo.findByUserId).mockResolvedValue({
      cedula: mockPersonalInfo.cedula,
      fullName: mockPersonalInfo.fullName,
      phone: mockPersonalInfo.phone,
      address: mockPersonalInfo.address,
      dateOfBirth: new Date('1990-01-15'),
    });

    const res = await request(app)
      .get('/api/me/personal-info')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.cedula).toBe(mockPersonalInfo.cedula);
    expect(res.body.fullName).toBe(mockPersonalInfo.fullName);
    expect(res.body.dateOfBirth).toBe('1990-01-15');
  });

  it('returns 200 with all-null fields when user not found', async () => {
    vi.mocked(meRepo.findByUserId).mockResolvedValue(null);

    const res = await request(app)
      .get('/api/me/personal-info')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockNullInfo);
  });
});

describe('PUT /api/me/personal-info (first time)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClientAuth();
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).put('/api/me/personal-info');
    expect(res.status).toBe(401);
  });

  it('returns 422 VALIDATION_ERROR when role is not client (missing cedula)', async () => {
    mockNonClientAuth('admin');

    const res = await request(app)
      .put('/api/me/personal-info')
      .set(authHeader())
      .send({ fullName: 'Test' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 VALIDATION_ERROR with empty body', async () => {
    vi.mocked(meRepo.findByUserId).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/me/personal-info')
      .set(authHeader())
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 with invalid cedula (non-numeric)', async () => {
    vi.mocked(meRepo.findByUserId).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/me/personal-info')
      .set(authHeader())
      .send({ cedula: 'abc', fullName: 'Test' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 with cedula too short (< 8 digits)', async () => {
    vi.mocked(meRepo.findByUserId).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/me/personal-info')
      .set(authHeader())
      .send({ cedula: '123', fullName: 'Test' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 with cedula too long (> 15 digits)', async () => {
    vi.mocked(meRepo.findByUserId).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/me/personal-info')
      .set(authHeader())
      .send({ cedula: '1234567890123456', fullName: 'Test' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 200 with data when valid body provided (first time)', async () => {
    vi.mocked(meRepo.findByUserId).mockResolvedValue(null);
    vi.mocked(meRepo.upsert).mockResolvedValue({
      cedula: mockPersonalInfo.cedula,
      fullName: mockPersonalInfo.fullName,
      phone: mockPersonalInfo.phone,
      address: mockPersonalInfo.address,
      dateOfBirth: new Date('1990-01-15'),
    });

    const res = await request(app)
      .put('/api/me/personal-info')
      .set(authHeader())
      .send(mockPersonalInfo);

    expect(res.status).toBe(200);
    expect(res.body.fullName).toBe(mockPersonalInfo.fullName);
    expect(res.body.cedula).toBe(mockPersonalInfo.cedula);
  });
});

describe('PATCH /api/me/personal-info (update)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClientAuth();
  });

  it('returns 422 VALIDATION_ERROR when role is not client', async () => {
    mockNonClientAuth('checker');

    const res = await request(app)
      .patch('/api/me/personal-info')
      .set(authHeader())
      .send({ fullName: 'New Name' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 VALIDATION_ERROR with empty body', async () => {
    vi.mocked(meRepo.findByUserId).mockResolvedValue({
      cedula: mockPersonalInfo.cedula,
      fullName: mockPersonalInfo.fullName,
      phone: mockPersonalInfo.phone,
      address: mockPersonalInfo.address,
      dateOfBirth: new Date('1990-01-15'),
    });

    const res = await request(app)
      .patch('/api/me/personal-info')
      .set(authHeader())
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 CEDULA_INVALIDATION when cedula already set and different', async () => {
    vi.mocked(meRepo.findByUserId).mockResolvedValue({
      cedula: '123456789',
      fullName: mockPersonalInfo.fullName,
      phone: mockPersonalInfo.phone,
      address: mockPersonalInfo.address,
      dateOfBirth: new Date('1990-01-15'),
    });

    const res = await request(app)
      .patch('/api/me/personal-info')
      .set(authHeader())
      .send({ cedula: '987654321' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('CEDULA_INVALIDATION');
    expect(res.body.error.message).toBe(
      'Cedula already set and cannot be modified',
    );
  });

  it('returns 200 when updating only fullName (no cedula change)', async () => {
    vi.mocked(meRepo.findByUserId).mockResolvedValue({
      cedula: mockPersonalInfo.cedula,
      fullName: mockPersonalInfo.fullName,
      phone: mockPersonalInfo.phone,
      address: mockPersonalInfo.address,
      dateOfBirth: new Date('1990-01-15'),
    });
    vi.mocked(meRepo.upsert).mockResolvedValue({
      cedula: mockPersonalInfo.cedula,
      fullName: 'New Name',
      phone: mockPersonalInfo.phone,
      address: mockPersonalInfo.address,
      dateOfBirth: new Date('1990-01-15'),
    });

    const res = await request(app)
      .patch('/api/me/personal-info')
      .set(authHeader())
      .send({ fullName: 'New Name' });

    expect(res.status).toBe(200);
    expect(res.body.fullName).toBe('New Name');
    expect(res.body.cedula).toBe(mockPersonalInfo.cedula);
  });

  it('returns 200 when cedula is same as existing value (no-op)', async () => {
    vi.mocked(meRepo.findByUserId).mockResolvedValue({
      cedula: '123456789',
      fullName: mockPersonalInfo.fullName,
      phone: mockPersonalInfo.phone,
      address: mockPersonalInfo.address,
      dateOfBirth: new Date('1990-01-15'),
    });
    vi.mocked(meRepo.upsert).mockResolvedValue({
      cedula: '123456789',
      fullName: mockPersonalInfo.fullName,
      phone: mockPersonalInfo.phone,
      address: mockPersonalInfo.address,
      dateOfBirth: new Date('1990-01-15'),
    });

    const res = await request(app)
      .patch('/api/me/personal-info')
      .set(authHeader())
      .send({ cedula: '123456789' });

    expect(res.status).toBe(200);
    expect(res.body.cedula).toBe('123456789');
  });
});

describe('GET /api/me/payments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClientAuth();
  });

  it('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/me/payments');

    expect(res.status).toBe(401);
  });

  it('returns 200 for admin role', async () => {
    mockNonClientAuth('admin');

    const res = await request(app)
      .get('/api/me/payments')
      .set(authHeader());

    expect(res.status).toBe(200);
  });

  it('returns 200 for checker role', async () => {
    mockNonClientAuth('checker');

    const res = await request(app)
      .get('/api/me/payments')
      .set(authHeader());

    expect(res.status).toBe(200);
  });

  it('returns 200 with paginated payment history', async () => {
    const mockPayments = [
      {
        id: 'pay-1',
        provider: 'mercadopago',
        subtotalCents: 50000,
        discountCents: 0,
        totalCents: 50000,
        status: 'completed',
        createdAt: new Date('2026-07-09T00:00:00Z'),
        tickets: [
          { id: 'ticket-1', ticketCode: 'TC001', status: 'paid' },
        ],
      },
    ];

    vi.mocked(paymentsRepo.findAllByUserId).mockResolvedValue(mockPayments);
    vi.mocked(paymentsRepo.countByUserId).mockResolvedValue(1);

    const res = await request(app)
      .get('/api/me/payments')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(20);
    expect(res.body.data[0].provider).toBe('mercadopago');
    expect(res.body.data[0].tickets).toHaveLength(1);
  });

  it('returns 200 with empty array when user has no payments', async () => {
    vi.mocked(paymentsRepo.findAllByUserId).mockResolvedValue([]);
    vi.mocked(paymentsRepo.countByUserId).mockResolvedValue(0);

    const res = await request(app)
      .get('/api/me/payments')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  it('respects page and limit query params', async () => {
    vi.mocked(paymentsRepo.findAllByUserId).mockResolvedValue([]);
    vi.mocked(paymentsRepo.countByUserId).mockResolvedValue(0);

    const res = await request(app)
      .get('/api/me/payments?page=2&limit=5')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(paymentsRepo.findAllByUserId).toHaveBeenCalledWith('user-123', 2, 5);
  });

  it('returns 422 with invalid pagination params', async () => {
    const res = await request(app)
      .get('/api/me/payments?page=0')
      .set(authHeader());

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
