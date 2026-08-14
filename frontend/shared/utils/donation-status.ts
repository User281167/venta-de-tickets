export type DonationState = "pending" | "confirmed" | "rejected" | "cancelled";

export const DONATION_STATE_VALUES: readonly DonationState[] = [
  "pending",
  "confirmed",
  "rejected",
  "cancelled",
] as const;

export const DONATION_STATE_COLORS: Record<DonationState, string> = {
  pending: "#eab308",
  confirmed: "#22c55e",
  rejected: "#ef4444",
  cancelled: "#6b7280",
};

export const DONATION_STATE_LABELS: Record<DonationState, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
};

export const DONATION_STATE_FILTER_OPTIONS: ReadonlyArray<{
  value: DonationState | "";
  label: string;
}> = [
  { value: "", label: "Todos los estados" },
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "rejected", label: "Rechazada" },
  { value: "cancelled", label: "Cancelada" },
];

export type DonationAccount = "LA_CONVENCION" | "BARRANQUEROS_UTP" | "VICTIMAS";

export const DONATION_ACCOUNT_LABELS: Record<DonationAccount, string> = {
  LA_CONVENCION: "Asociación de Egresados UTP",
  BARRANQUEROS_UTP: "Barranqueros UTP",
  VICTIMAS: "Víctimas y damnificados",
};

export const DONATION_ACCOUNT_FILTER_OPTIONS: ReadonlyArray<{
  value: DonationAccount | "";
  label: string;
}> = [
  { value: "", label: "Todas las cuentas" },
  { value: "LA_CONVENCION", label: "Asociación de Egresados UTP" },
  { value: "BARRANQUEROS_UTP", label: "Barranqueros UTP" },
  { value: "VICTIMAS", label: "Víctimas y damnificados" },
];
