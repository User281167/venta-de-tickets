import type { PaymentProvider } from '../payments.types.js';

const providers = new Map<string, PaymentProvider>();

function normalizeProviderName(name: string) {
  return name.trim().toLowerCase();
}

function registerKnownProviders() {
  // Future provider modules can self-register on import.
}

registerKnownProviders();

export function registerProvider(name: string, provider: PaymentProvider) {
  providers.set(normalizeProviderName(name), provider);
}

export function getProvider(name: string): PaymentProvider {
  const provider = providers.get(normalizeProviderName(name));

  if (!provider) {
    throw new Error(`Payment provider "${name}" is not registered.`);
  }

  return provider;
}

export function listRegisteredProviders() {
  return Array.from(providers.keys());
}
