import type { PaymentItem, PaymentListResponse } from "../../types/payment.types";

let counter = 0;

export function createMockPayment(overrides?: Partial<PaymentItem>): PaymentItem {
  counter++;
  return {
    id: `payment-${counter}`,
    provider: "mercadopago",
    subtotalCents: 25000,
    discountCents: 0,
    totalCents: 25000,
    status: "completed",
    createdAt: new Date(2026, 6, counter).toISOString(),
    tickets: [
      { id: `ticket-${counter}-1`, ticketCode: `TKT${String(counter).padStart(6, "0")}`, status: "paid" },
    ],
    ...overrides,
  };
}

export function createMockPaymentList(
  count: number,
  overrides?: Partial<PaymentListResponse>,
): PaymentListResponse {
  return {
    data: Array.from({ length: count }, (_, i) => createMockPayment({ subtotalCents: (i + 1) * 10000, discountCents: 0, totalCents: (i + 1) * 10000 })),
    total: count,
    page: 1,
    limit: 20,
    ...overrides,
  };
}
