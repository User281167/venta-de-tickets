export type KeySource = 'ip' | 'user' | 'global';

export interface RateLimitPolicy {
  identifier: string;
  limit: number;
  window: `${number} ${'s' | 'm' | 'h'}`;
  keySource: KeySource;
}

export const POLICIES = {
  publicRead: {
    identifier: 'public-read',
    limit: 60,
    window: '1 m',
    keySource: 'ip',
  },
  publicWrite: {
    identifier: 'public-write',
    limit: 5,
    window: '1 m',
    keySource: 'ip',
  },
  client: {
    identifier: 'client',
    limit: 200,
    window: '1 m',
    keySource: 'user',
  },
  clientWrite: {
    identifier: 'client-write',
    limit: 30,
    window: '1 m',
    keySource: 'user',
  },
  admin: {
    identifier: 'admin',
    limit: 20,
    window: '1 m',
    keySource: 'user',
  },
  superAdmin: {
    identifier: 'super-admin',
    limit: 30,
    window: '1 m',
    keySource: 'user',
  },
  webhookGlobal: {
    identifier: 'webhook-global',
    limit: 1000,
    window: '10 s',
    keySource: 'global',
  },
} satisfies Record<string, RateLimitPolicy>;
