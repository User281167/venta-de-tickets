import { DonationAccount } from "@prisma/client";

export const DONATION_ACCOUNT_LABELS: Record<DonationAccount, string> = {
  LA_CONVENCION: "La Convención",
  BARRANQUEROS_UTP: "Barranqueros UTP",
  VICTIMAS: "Víctimas y damnificados"
};
