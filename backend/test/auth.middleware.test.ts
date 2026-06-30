import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { UnauthorizedError } from '../src/shared/errors/UnauthorizedError.js';

vi.mock('../src/shared/services/auth.service.js', () => ({
  verifyToken: vi.fn(),
}));

const { verifyToken } = await import(
  '../src/shared/services/auth.service.js'
);

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
