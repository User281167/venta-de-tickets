import type { EmailProvider } from './email-provider.interface.js';
import { ResendProvider } from './resend.provider.js';

const providers = new Map<string, EmailProvider>();

function normalizeProviderName(name: string) {
  return name.trim().toLowerCase();
}

function registerKnownProviders() {
  registerEmailProvider('resend', new ResendProvider());
}

export function registerEmailProvider(name: string, provider: EmailProvider) {
  providers.set(normalizeProviderName(name), provider);
}

export function getEmailProvider(name = 'resend'): EmailProvider {
  const provider = providers.get(normalizeProviderName(name));
  if (!provider) {
    throw new Error(`Email provider "${name}" is not registered.`);
  }

  return provider;
}

export function listRegisteredEmailProviders() {
  return Array.from(providers.keys());
}

registerKnownProviders();
