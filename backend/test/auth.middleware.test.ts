import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { UnauthorizedError } from '../src/shared/errors/UnauthorizedError.js';

vi.mock('../src/shared/services/auth.service.js', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('../src/shared/services/role-resolver.js', () => ({
  resolveRole: vi.fn(),
}));

vi.mock('../src/modules/users/users.service.js', () => ({
  getPrivacyStatus: vi.fn(),
}));

vi.mock('../src/modules/me/me.service.js', () => ({
  getPersonalInfo: vi.fn(),
}));

const { verifyToken } = await import('../src/shared/services/auth.service.js');
const { resolveRole } = await import('../src/shared/services/role-resolver.js');
const { getPrivacyStatus } = await import('../src/modules/users/users.service.js');
const { getPersonalInfo } = await import('../src/modules/me/me.service.js');

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('T015 — returns 401 when no Authorization header', async () => {
    const res = await request(app).get('/api/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('T015 — returns 401 when header is malformed', async () => {
    const res = await request(app)
      .get('/api/me')
      .set('Authorization', 'Basic sometoken');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('T015 — returns 401 when token is empty', async () => {
    const res = await request(app)
      .get('/api/me')
      .set('Authorization', 'Bearer ');
    expect(res.status).toBe(401);
  });

  it('T016 — returns 401 when token is invalid/expired', async () => {
    vi.mocked(verifyToken).mockRejectedValueOnce(
      new UnauthorizedError('Invalid or expired token'),
    );

    const res = await request(app)
      .get('/api/me')
      .set('Authorization', 'Bearer some-invalid-token');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('T017 — returns 401 when token is tampered', async () => {
    vi.mocked(verifyToken).mockRejectedValueOnce(
      new UnauthorizedError('Invalid or expired token'),
    );

    const res = await request(app)
      .get('/api/me')
      .set('Authorization', 'Bearer tampered.jwt.here');
    expect(res.status).toBe(401);
  });

  it('T018 — returns 200 when token is valid', async () => {
    vi.mocked(verifyToken).mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com',
      role: 'super_admin',
    });
    vi.mocked(resolveRole).mockResolvedValueOnce('super_admin');
    vi.mocked(getPrivacyStatus).mockResolvedValue({
      consentStatus: {
        required: true,
        acceptedAt: null,
        policyVersion: '1.0',
      },
    });
    vi.mocked(getPersonalInfo).mockResolvedValue({
      fullName: null,
      phone: null,
      cedula: null,
      address: null,
      dateOfBirth: null,
    });

    const res = await request(app)
      .get('/api/me')
      .set('Authorization', 'Bearer valid.jwt.token');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      user: { id: 'user-123', email: 'test@example.com' },
    });
  });
});
