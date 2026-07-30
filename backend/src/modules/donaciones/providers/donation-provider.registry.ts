import type { DonationProvider } from './donation-provider.types.js';
import { env } from '../../../shared/config/env.js';
import { MercadoPagoDonationProvider } from './mercadopago.donation.provider.js';
import { EpaycoDonationProvider } from './epayco.donation.provider.js';

const providers = new Map<string, DonationProvider>();

function normalizeProviderName(name: string) {
  return name.trim().toLowerCase();
}

function registerKnownDonationProviders() {
  registerDonationProvider('mercadopago-la-convencion', new MercadoPagoDonationProvider({
    accessToken: env.MERCADOPAGO_ACCESS_TOKEN,
    webhookSecret: env.MERCADOPAGO_WEBHOOK_SECRET,
    providerName: 'mercadopago-la-convencion',
    notificationUrl: `${env.API_URL}/api/donaciones/webhook/mercadopago-la-convencion`,
  }));

  registerDonationProvider('mercadopago-barranqueros-utp', new MercadoPagoDonationProvider({
    accessToken: env.MERCADOPAGO_ACCESS_TOKEN,
    webhookSecret: env.MERCADOPAGO_WEBHOOK_SECRET,
    providerName: 'mercadopago-barranqueros-utp',
    notificationUrl: `${env.API_URL}/api/donaciones/webhook/mercadopago-barranqueros-utp`,
  }));

  registerDonationProvider('epayco-la-convencion', new EpaycoDonationProvider({
    providerName: 'epayco-la-convencion',
    account: 'LA_CONVENCION',
    notificationUrl: `${env.API_URL}/api/donaciones/webhook/epayco-la-convencion`,
  }));

  registerDonationProvider('epayco-barranqueros-utp', new EpaycoDonationProvider({
    providerName: 'epayco-barranqueros-utp',
    account: 'BARRANQUEROS_UTP',
    notificationUrl: `${env.API_URL}/api/donaciones/webhook/epayco-barranqueros-utp`,
  }));
}

registerKnownDonationProviders();

export function registerDonationProvider(name: string, provider: DonationProvider) {
  providers.set(normalizeProviderName(name), provider);
}

export function getDonationProvider(name: string): DonationProvider {
  const provider = providers.get(normalizeProviderName(name));

  if (!provider) {
    throw new Error(`Donation provider "${name}" is not registered.`);
  }

  return provider;
}

export function listRegisteredDonationProviders() {
  return Array.from(providers.keys());
}
