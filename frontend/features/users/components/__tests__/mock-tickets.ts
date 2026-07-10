import type { TicketItem, TicketListResponse } from "../../types/ticket.types";

let counter = 0;

export function createMockTicket(overrides?: Partial<TicketItem>): TicketItem {
  counter++;
  return {
    id: `ticket-${counter}`,
    ticketCode: `TKT${String(counter).padStart(6, "0")}`,
    qrToken: `qr-${counter}`,
    status: "paid",
    purchasedAt: new Date(2026, 6, counter).toISOString(),
    createdAt: new Date(2026, 6, counter).toISOString(),
    ticketType: { id: "tt-1", name: "General", price: 50000 },
    ...overrides,
  };
}

export function createMockTicketList(
  count: number,
  overrides?: Partial<TicketListResponse>,
): TicketListResponse {
  return {
    data: Array.from({ length: count }, (_, i) =>
      createMockTicket({ ticketType: { id: `tt-${i}`, name: `Tipo ${i + 1}`, price: (i + 1) * 10000 } }),
    ),
    total: count,
    page: 1,
    limit: 20,
    ...overrides,
  };
}
