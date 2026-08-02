import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '../config/env.js';
import { logger } from '../../utils/logger.js';
import { TooManyRequestsError } from '../errors/TooManyRequestsError.js';
import type { KeySource, RateLimitPolicy } from './rate-limit.policies.js';

type Limiter = Ratelimit | InMemoryLimiter;

interface InMemoryEntry {
  count: number;
  resetAt: number;
}

class InMemoryLimiter {
  private store = new Map<string, InMemoryEntry>();
  private readonly max: number;
  private readonly windowMs: number;

  constructor(limit: number, window: string) {
    this.max = limit;
    this.windowMs = parseWindow(window);
  }

  async limit(key: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return {
        success: true,
        limit: this.max,
        remaining: this.max - 1,
        reset: now + this.windowMs,
      };
    }

    entry.count++;
    const remaining = Math.max(0, this.max - entry.count);

    return {
      success: entry.count <= this.max,
      limit: this.max,
      remaining,
      reset: entry.resetAt,
    };
  }
}

function parseWindow(window: string): number {
  const [value, unit] = window.split(' ');
  const n = Number(value);

  switch (unit) {
    case 's':
      return n * 1000;
    case 'm':
      return n * 60 * 1000;
    case 'h':
      return n * 60 * 60 * 1000;
    default:
      throw new Error(`Invalid window unit: ${unit}`);
  }
}

let redisSingleton: Redis | null = null;

function getRedis(): Redis | null {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  if (!redisSingleton) {
    redisSingleton = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redisSingleton;
}

const limiterCache = new Map<string, Limiter>();

export function _resetLimiterCache(): void {
  limiterCache.clear();
  redisSingleton = null;
}

function getLimiter(policy: RateLimitPolicy): Limiter {
  const cached = limiterCache.get(policy.identifier);
  if (cached) return cached;

  const redis = getRedis();
  let limiter: Limiter;

  if (redis) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(policy.limit, policy.window),
      prefix: `rl:${policy.identifier}`,
      analytics: false,
    });
  } else {
    logger.warn(
      { identifier: policy.identifier },
      'Upstash env vars not set — using in-memory rate limiter (DEV/TEST ONLY)',
    );
    limiter = new InMemoryLimiter(policy.limit, policy.window);
  }

  limiterCache.set(policy.identifier, limiter);
  return limiter;
}

function extractKey(req: Request, source: KeySource, identifier: string): string {
  switch (source) {
    case 'ip': {
      const forwarded = req.headers['x-forwarded-for'];

      if (typeof forwarded === 'string' && forwarded.length > 0) {
        return forwarded.split(',')[0]!.trim();
      }

      return req.ip ?? req.socket.remoteAddress ?? 'unknown';
    }

    case 'user': {
      if (!req.user?.id) {
        throw new Error(
          `rateLimit policy '${identifier}' requires authMiddleware before it`,
        );
      }

      return req.user.id;
    }
    case 'global':
      return identifier;
  }
}

export function rateLimit(policy: RateLimitPolicy): RequestHandler {
  if (env.RATE_LIMIT_DISABLED) {
    return (_req, _res, next) => next();
  }

  const limiter = getLimiter(policy);

  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    let key: string;
    try {
      key = extractKey(req, policy.keySource, policy.identifier);
    } catch (err) {
      next(err);
      return;
    }

    let result: Awaited<ReturnType<Limiter['limit']>>;
    try {
      result = await limiter.limit(key);
    } catch (err) {
      if (env.RATE_LIMIT_FAIL_OPEN) {
        logger.warn(
          { err, identifier: policy.identifier, key },
          'Rate limiter failed — allowing request (fail-open)',
        );

        next();
        return;
      }
      next(err);
      return;
    }

    res.setHeader('X-RateLimit-Limit', String(result.limit));
    res.setHeader('X-RateLimit-Remaining', String(result.remaining));
    res.setHeader('X-RateLimit-Reset', String(result.reset));

    if (!result.success) {
      const retryAfter = Math.max(
        0,
        Math.ceil((result.reset - Date.now()) / 1000),
      );

      next(
        new TooManyRequestsError(
          'Demasiadas solicitudes. Intenta de nuevo más tarde.',
          retryAfter,
        ),
      );
      return;
    }

    next();
  };
}
