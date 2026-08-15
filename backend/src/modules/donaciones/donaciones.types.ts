import { DonationAccount } from '@prisma/client';

export const DONATION_ACCOUNT_LABELS: Record<DonationAccount, string> = {
  LA_CONVENCION: 'Asociación de Egresados UTP',
  BARRANQUEROS_UTP: 'Barranqueros UTP',
  VICTIMAS: 'Víctimas y damnificados',
};

export const DONATION_COUNTER_ID = 1;
