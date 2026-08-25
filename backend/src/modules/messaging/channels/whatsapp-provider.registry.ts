import { InfobipProvider } from './infobip.provider.js';
import type { WhatsAppProvider } from './whatsapp-provider.interface.js';

const providers = new Map<string, WhatsAppProvider>();

function normalizeProviderName(name: string) {
  return name.trim().toLowerCase();
}

function registerKnownProviders() {
  registerWhatsAppProvider('infobip', new InfobipProvider());
  // registerWhatsAppProvider('meta', new MetaProvider());
}

export function registerWhatsAppProvider(
  name: string,
  provider: WhatsAppProvider,
) {
  providers.set(normalizeProviderName(name), provider);
}

export function getWhatsAppProvider(name = 'infobip'): WhatsAppProvider {
  const provider = providers.get(normalizeProviderName(name));
  if (!provider) {
    throw new Error(`WhatsApp provider "${name}" is not registered.`);
  }

  return provider;
}

export function listRegisteredWhatsAppProviders() {
  return Array.from(providers.keys());
}

registerKnownProviders();
