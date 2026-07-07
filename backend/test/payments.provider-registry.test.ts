import { describe, expect, it } from 'vitest';

import {
  getProvider,
  registerProvider,
} from '../src/modules/payments/providers/provider.registry.js';

const sampleProvider = {
  getProviderName: () => 'sample',
  createCheckout: async () => ({
    checkoutUrl: 'https://example.com/checkout',
    providerTxId: 'tx-1',
  }),
  verifySignature: () => true,
  parseWebhook: () => ({
    reference: 'payment-1',
    status: 'approved' as const,
    externalId: 'tx-1',
    rawPayload: {},
  }),
};

describe('provider.registry', () => {
  it('registers and resolves providers by normalized name', () => {
    registerProvider('Sample', sampleProvider);

    expect(getProvider('sample')).toBe(sampleProvider);
    expect(getProvider('SAMPLE')).toBe(sampleProvider);
  });

  it('throws a clean error for unknown providers', () => {
    expect(() => getProvider('nonexistent')).toThrow(
      'Payment provider "nonexistent" is not registered.',
    );
  });

  it('resolves auto-registered mercadopago provider', () => {
    const provider = getProvider('mercadopago');
    expect(provider.getProviderName()).toBe('mercadopago');
  });
});
