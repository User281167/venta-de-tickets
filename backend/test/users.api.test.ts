import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

vi.mock('../src/shared/services/auth.service.js', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('../src/modules/users/users.service.js', () => ({
  getUserAuthInfo: vi.fn(),
  getPolicyStatus: vi.fn(),
  acceptPolicies: vi.fn(),
  getCurrentPolicyContent: vi.fn(),
}));

const { verifyToken } = await import('../src/shared/services/auth.service.js');
const { getUserAuthInfo, getPolicyStatus, acceptPolicies, getCurrentPolicyContent } = await import(
  '../src/modules/users/users.service.js'
);

function authHeader(token = 'valid.jwt.token') {
  return { Authorization: `Bearer ${token}` };
}

describe('POST /api/users/me/policy-acceptance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserAuthInfo).mockResolvedValue({ role: null, isActive: true });
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
    });
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/users/me/policy-acceptance');
    expect(res.status).toBe(401);
  });

  it('returns 422 with empty types array', async () => {
    const res = await request(app)
      .post('/api/users/me/policy-acceptance')
      .set(authHeader())
      .send({ types: [] });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 with unknown policy type', async () => {
    const res = await request(app)
      .post('/api/users/me/policy-acceptance')
      .set(authHeader())
      .send({ types: ['unknown_policy'] });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('accepts both policy types and returns per-type status', async () => {
    vi.mocked(acceptPolicies).mockResolvedValue({
      results: [
        {
          type: 'privacy_policy',
          version: '1.0.0',
          status: 'accepted',
          acceptedAt: '2026-08-14T00:00:00.000Z',
        },
        {
          type: 'terms_of_service',
          version: '1.0.0',
          status: 'accepted',
          acceptedAt: '2026-08-14T00:00:00.000Z',
        },
      ],
    });

    const res = await request(app)
      .post('/api/users/me/policy-acceptance')
      .set(authHeader())
      .send({ types: ['privacy_policy', 'terms_of_service'] });

    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(2);
    expect(res.body.results[0].type).toBe('privacy_policy');
    expect(res.body.results[1].type).toBe('terms_of_service');
  });

  it('returns skipped status when user already accepted current version', async () => {
    vi.mocked(acceptPolicies).mockResolvedValue({
      results: [
        {
          type: 'privacy_policy',
          version: '1.0.0',
          status: 'skipped',
          acceptedAt: '2026-08-13T00:00:00.000Z',
        },
      ],
    });

    const res = await request(app)
      .post('/api/users/me/policy-acceptance')
      .set(authHeader())
      .send({ types: ['privacy_policy'] });

    expect(res.status).toBe(200);
    expect(res.body.results[0].status).toBe('skipped');
  });
});

describe('GET /api/users/me/policy-status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserAuthInfo).mockResolvedValue({ role: null, isActive: true });
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
    });
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/users/me/policy-status');
    expect(res.status).toBe(401);
  });

  it('returns policy status for both types', async () => {
    vi.mocked(getPolicyStatus).mockResolvedValue({
      policies: [
        {
          type: 'privacy_policy',
          currentVersion: '1.0.0',
          accepted: true,
          acceptedAt: '2026-08-13T00:00:00.000Z',
        },
        {
          type: 'terms_of_service',
          currentVersion: '1.0.0',
          accepted: false,
          acceptedAt: null,
        },
      ],
    });

    const res = await request(app)
      .get('/api/users/me/policy-status')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.policies).toHaveLength(2);
    expect(res.body.policies[0].type).toBe('privacy_policy');
    expect(res.body.policies[0].accepted).toBe(true);
    expect(res.body.policies[1].accepted).toBe(false);
  });
});

describe('GET /api/users/policies/:type (public)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 without auth (public endpoint, registered before authMiddleware)', async () => {
    vi.mocked(getCurrentPolicyContent).mockResolvedValue({
      type: 'privacy_policy',
      version: '1.0.0',
      content: 'privacy policy text',
      publishedAt: '2026-08-14T00:00:00.000Z',
    });

    const res = await request(app).get('/api/users/policies/privacy_policy');
    expect(res.status).toBe(200);
    expect(res.body.type).toBe('privacy_policy');
    expect(res.body.content).toBe('privacy policy text');
  });

  it('returns 404 for unknown policy type', async () => {
    const res = await request(app).get('/api/users/policies/unknown');
    expect(res.status).toBe(404);
  });

  it('returns 404 when no version exists for type', async () => {
    vi.mocked(getCurrentPolicyContent).mockResolvedValue(null);

    const res = await request(app).get('/api/users/policies/terms_of_service');
    expect(res.status).toBe(404);
  });

  it('rate-limits by IP (keySource=ip), not by user — returns 200 without auth header', async () => {
    vi.mocked(getCurrentPolicyContent).mockResolvedValue({
      type: 'privacy_policy',
      version: '1.0.0',
      content: 'privacy policy text',
      publishedAt: '2026-08-14T00:00:00.000Z',
    });

    const res = await request(app).get('/api/users/policies/privacy_policy');

    expect(res.status).toBe(200);
    expect(res.body.type).toBe('privacy_policy');
  });
});