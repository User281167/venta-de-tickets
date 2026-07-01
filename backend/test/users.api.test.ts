import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

vi.mock('../src/shared/services/auth.service.js', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('../src/shared/services/role-resolver.js', () => ({
  resolveRole: vi.fn(),
}));

vi.mock('../src/modules/surveys/surveys.repository.js', () => ({
  existsByUserAndType: vi.fn(),
}));

vi.mock('../src/modules/users/users.repository.js', () => ({
  findById: vi.fn(),
  update: vi.fn(),
  findPrivacyAcceptance: vi.fn(),
  createPrivacyAcceptance: vi.fn(),
}));

const { verifyToken } = await import('../src/shared/services/auth.service.js');
const { resolveRole } = await import('../src/shared/services/role-resolver.js');

const repo = await import('../src/modules/users/users.repository.js');

function authHeader(token = 'valid.jwt.token') {
  return { Authorization: `Bearer ${token}` };
}

describe('GET /api/users/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveRole).mockResolvedValue(null);
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
    });
  });

  it('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('returns user and consentStatus with valid token', async () => {
    vi.mocked(repo.findById).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      fullName: 'Juan Pérez',
      phone: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(repo.findPrivacyAcceptance).mockResolvedValue(null);

    const res = await request(app).get('/api/users/me').set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.fullName).toBe('Juan Pérez');
    expect(res.body.consentStatus.required).toBe(true);
    expect(res.body.consentStatus.acceptedAt).toBeNull();
  });
});

describe('PATCH /api/users/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveRole).mockResolvedValue(null);
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
    });
  });

  it('returns 422 with empty body', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set(authHeader())
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 when email field is sent (strict rejection)', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set(authHeader())
      .send({ fullName: 'New Name', email: 'other@example.com' });

    expect(res.status).toBe(422);
    expect(res.body.error.message).toContain('Unrecognized key');
  });

  it('returns 422 when id field is sent (strict rejection)', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set(authHeader())
      .send({ fullName: 'New Name', id: 'some-id' });

    expect(res.status).toBe(422);
    expect(res.body.error.message).toContain('Unrecognized key');
  });

  it('returns 422 when phone is too short (less than 10)', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set(authHeader())
      .send({ fullName: 'Juan Pérez', phone: '12345' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 200 with valid body', async () => {
    vi.mocked(repo.update).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      fullName: 'Juan Pérez Actualizado',
      phone: '3001234567',
    });

    const res = await request(app)
      .patch('/api/users/me')
      .set(authHeader())
      .send({ fullName: 'Juan Pérez Actualizado', phone: '3001234567' });

    expect(res.status).toBe(200);
    expect(res.body.user.fullName).toBe('Juan Pérez Actualizado');
  });
});

describe('POST /api/users/me/privacy-acceptance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveRole).mockResolvedValue(null);
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
    });
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/users/me/privacy-acceptance');
    expect(res.status).toBe(401);
  });

  it('creates acceptance and returns status + acceptedAt', async () => {
    const now = new Date();
    vi.mocked(repo.findPrivacyAcceptance).mockResolvedValue(null);
    vi.mocked(repo.createPrivacyAcceptance).mockResolvedValue({
      id: 'acc-1',
      policyVersion: '1.0.0',
      policyType: 'privacy_policy',
      acceptedAt: now,
    });

    const res = await request(app)
      .post('/api/users/me/privacy-acceptance')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('accepted');
    expect(res.body.acceptedAt).toBe(now.toISOString());
  });

  it('returns existing acceptance if already accepted', async () => {
    const now = new Date();
    vi.mocked(repo.findPrivacyAcceptance).mockResolvedValue({
      acceptedAt: now,
      policyVersion: '1.0.0',
    });

    const res = await request(app)
      .post('/api/users/me/privacy-acceptance')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('accepted');
    expect(res.body.policyVersion).toBe('1.0.0');
  });
});

describe('GET /api/users/me/privacy-status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveRole).mockResolvedValue(null);
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
    });
  });

  it('returns consent status', async () => {
    const acceptedAt = new Date('2025-06-01');
    vi.mocked(repo.findById).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      fullName: 'Juan Pérez',
      phone: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(repo.findPrivacyAcceptance).mockResolvedValue({
      acceptedAt,
      policyVersion: '1.0.0',
    });

    const res = await request(app)
      .get('/api/users/me/privacy-status')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.consentStatus.acceptedAt).toBe(acceptedAt.toISOString());
    expect(res.body.consentStatus.policyVersion).toBe('1.0.0');
  });
});
