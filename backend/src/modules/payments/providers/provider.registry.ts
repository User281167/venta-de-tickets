import type { PaymentProvider } from '../payments.types.js';
import { MercadoPagoProvider } from './mercadopago.provider.js';

const providers = new Map<string, PaymentProvider>();

function normalizeProviderName(name: string) {
  return name.trim().toLowerCase();
}

function registerKnownProviders() {
  registerProvider('mercadopago', new MercadoPagoProvider());
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
