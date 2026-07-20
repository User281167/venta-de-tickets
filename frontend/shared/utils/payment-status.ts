export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "expired"
  | "completed_unfulfillable";

export const PAYMENT_STATUS_VALUES: readonly PaymentStatus[] = [
  "pending",
  "completed",
  "failed",
  "refunded",
  "expired",
  "completed_unfulfillable",
] as const;

export const STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: "#eab308",
  completed: "#22c55e",
  failed: "#ef4444",
  refunded: "#6b7280",
  expired: "#9ca3af",
  completed_unfulfillable: "#f59e0b",
};

export const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pendiente",
  completed: "Completado",
  failed: "Fallido",
  refunded: "Reembolsado",
  expired: "Expirado",
  completed_unfulfillable: "Pago sin entradas",
};

export const STATUS_FILTER_OPTIONS: ReadonlyArray<{
  value: PaymentStatus | "";
  label: string;
}> = [
  { value: "", label: "Todos los estados" },
  { value: "pending", label: "Pendiente" },
  { value: "completed", label: "Completado" },
  { value: "failed", label: "Fallido" },
  { value: "refunded", label: "Reembolsado" },
  { value: "expired", label: "Expirado" },
  { value: "completed_unfulfillable", label: "Pago sin entradas" },
];

export function canRefund(status: string): boolean {
  return status === "completed" || status === "completed_unfulfillable";
}
