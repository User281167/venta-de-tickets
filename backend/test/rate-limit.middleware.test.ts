import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { _resetLimiterCache, rateLimit } from '../src/shared/middlewares/rate-limit.middleware.js';
import { POLICIES } from '../src/shared/middlewares/rate-limit.policies.js';
import { env } from '../src/shared/config/env.js';

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    ip: '127.0.0.1',
    headers: {},
    socket: { remoteAddress: '127.0.0.1' } as Request['socket'],
    user: undefined,
    ...overrides,
  } as unknown as Request;
}

function makeRes(): Response {
  const headers: Record<string, string> = {};
  return {
    setHeader: vi.fn((name: string, value: string) => {
      headers[name] = value;
    }),
    getHeader: vi.fn((name: string) => headers[name]),
  } as unknown as Response;
}

describe('rateLimit middleware', () => {
  beforeEach(() => {
    (env as { RATE_LIMIT_DISABLED: boolean }).RATE_LIMIT_DISABLED = false;
    _resetLimiterCache();
  });

  it('allows requests under the limit and sets headers', async () => {
    const middleware = rateLimit({ ...POLICIES.publicRead, limit: 3, window: '10 s' });
    const next = vi.fn();

    for (let i = 0; i < 3; i++) {
      const req = makeReq();
      const res = makeRes();
      await middleware(req, res, next);
    }

    expect(next).toHaveBeenCalledTimes(3);
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('blocks the request that exceeds the limit and sets Retry-After', async () => {
    const middleware = rateLimit({ ...POLICIES.publicRead, limit: 2, window: '10 s' });
    const next = vi.fn();
    const errs: unknown[] = [];

    for (let i = 0; i < 2; i++) {
      await middleware(makeReq(), makeRes(), next);
    }
    await middleware(makeReq(), makeRes(), (err) => errs.push(err));

    expect(errs).toHaveLength(1);
    const err = errs[0] as { statusCode: number; code: string; retryAfter: number };
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(err.retryAfter).toBeGreaterThanOrEqual(0);
  });

  it('isolates limits per IP', async () => {
    const middleware = rateLimit({ ...POLICIES.publicRead, limit: 1, window: '10 s' });
    const next = vi.fn();
    const errs: unknown[] = [];

    await middleware(makeReq({ ip: '1.1.1.1' }), makeRes(), next);
    await middleware(makeReq({ ip: '2.2.2.2' }), makeRes(), next);
    await middleware(makeReq({ ip: '1.1.1.1' }), makeRes(), (err) => errs.push(err));

    expect(next).toHaveBeenCalledTimes(2);
    expect(errs).toHaveLength(1);
  });

  it('isolates limits per user id when keySource=user', async () => {
    const middleware = rateLimit({ ...POLICIES.client, limit: 1, window: '10 s' });
    const next = vi.fn();
    const errs: unknown[] = [];

    await middleware(
      makeReq({ user: { id: 'user-a', email: 'a@a', role: 'user' } }),
      makeRes(),
      next,
    );
    await middleware(
      makeReq({ user: { id: 'user-b', email: 'b@b', role: 'user' } }),
      makeRes(),
      next,
    );
    await middleware(
      makeReq({ user: { id: 'user-a', email: 'a@a', role: 'user' } }),
      makeRes(),
      (err) => errs.push(err),
    );

    expect(next).toHaveBeenCalledTimes(2);
    expect(errs).toHaveLength(1);
  });

  it('throws when user keySource is used without auth middleware', async () => {
    const middleware = rateLimit(POLICIES.client);
    const errs: unknown[] = [];
    await middleware(makeReq(), makeRes(), (err) => errs.push(err));
    expect(errs).toHaveLength(1);
    expect((errs[0] as Error).message).toMatch(/authMiddleware/);
  });

  it('uses a single global key for keySource=global', async () => {
    const middleware = rateLimit({ ...POLICIES.webhookGlobal, limit: 1, window: '10 s' });
    const next = vi.fn();
    const errs: unknown[] = [];

    await middleware(makeReq({ ip: '1.1.1.1' }), makeRes(), next);
    await middleware(makeReq({ ip: '2.2.2.2' }), makeRes(), (err) => errs.push(err));

    expect(next).toHaveBeenCalledTimes(1);
    expect(errs).toHaveLength(1);
  });
});
