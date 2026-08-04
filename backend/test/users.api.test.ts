import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

vi.mock('../src/shared/services/auth.service.js', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('../src/modules/users/users.service.js', () => ({
  getUserAuthInfo: vi.fn(),
  getPrivacyStatus: vi.fn(),
  acceptPrivacy: vi.fn(),
}));

const { verifyToken } = await import('../src/shared/services/auth.service.js');
const { getUserAuthInfo, getPrivacyStatus, acceptPrivacy } = await import('../src/modules/users/users.service.js');

function authHeader(token = 'valid.jwt.token') {
  return { Authorization: `Bearer ${token}` };
}

describe('POST /api/users/me/privacy-acceptance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserAuthInfo).mockResolvedValue({ role: null, isActive: true });
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
    vi.mocked(acceptPrivacy).mockResolvedValue({
      status: 'accepted',
      acceptedAt: now.toISOString(),
      policyVersion: '1.0.0',
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
    vi.mocked(acceptPrivacy).mockResolvedValue({
      status: 'accepted',
      acceptedAt: now.toISOString(),
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
    vi.mocked(getUserAuthInfo).mockResolvedValue({ role: null, isActive: true });
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
    });
  });

  it('returns consent status', async () => {
    const acceptedAt = new Date('2025-06-01');
    vi.mocked(getPrivacyStatus).mockResolvedValue({
      consentStatus: {
        required: true,
        acceptedAt: acceptedAt.toISOString(),
        policyVersion: '1.0.0',
      },
    });

    const res = await request(app)
      .get('/api/users/me/privacy-status')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.consentStatus.acceptedAt).toBe(acceptedAt.toISOString());
    expect(res.body.consentStatus.policyVersion).toBe('1.0.0');
  });
});
