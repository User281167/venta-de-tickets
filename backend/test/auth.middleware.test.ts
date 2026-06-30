import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';

const SECRET = 'test-jwt-secret-for-qa';

function makeToken(payload: Record<string, unknown>, opts?: jwt.SignOptions) {
  return jwt.sign(payload, SECRET, opts);
}

describe('Auth Middleware', () => {
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

  it('T016 — returns 401 when token is expired', async () => {
    const token = makeToken(
      { sub: 'u1', email: 'test@example.com' },
      { expiresIn: '-1s' },
    );
    const res = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('T017 — returns 401 when token is tampered', async () => {
    const valid = makeToken(
      { sub: 'u1', email: 'test@example.com' },
      { expiresIn: '1h' },
    );
    const parts = valid.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({ sub: 'hacked', email: 'hacker@example.com' }),
    ).toString('base64url');
    const tampered = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    const res = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${tampered}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('T018 — returns 200 + user when token is valid', async () => {
    const token = makeToken(
      { sub: '550e8400-e29b-41d4-a716-446655440000', email: 'test@example.com' },
      { expiresIn: '1h' },
    );
    const res = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(res.body.user.email).toBe('test@example.com');
  });
});
