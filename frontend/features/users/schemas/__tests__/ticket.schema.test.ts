import { describe, it, expect } from "vitest";
import {
  ticketItemSchema,
  ticketListResponseSchema,
  ticketStatusSchema,
} from "../ticket.schema";

describe("ticketStatusSchema", () => {
  it("accepts all valid statuses", () => {
    const valid = ["reserved", "paid", "pending_confirmation", "confirmed", "used", "cancelled", "expired"];
    for (const s of valid) {
      expect(ticketStatusSchema.safeParse(s).success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    expect(ticketStatusSchema.safeParse("unknown").success).toBe(false);
  });
});

describe("ticketItemSchema", () => {
  const validItem = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    ticketCode: "TKT000001",
    qrToken: "qr-abc-123",
    status: "paid",
    purchasedAt: "2026-07-10T12:00:00Z",
    createdAt: "2026-07-10T12:00:00Z",
    ticketType: { id: "tt-1", name: "General", price: 50000 },
  };

  it("accepts valid ticket", () => {
    expect(ticketItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts ticket with null qrToken", () => {
    expect(ticketItemSchema.safeParse({ ...validItem, qrToken: null }).success).toBe(true);
  });

  it("accepts ticket with null purchasedAt", () => {
    expect(ticketItemSchema.safeParse({ ...validItem, purchasedAt: null }).success).toBe(true);
  });

  it("rejects missing ticketCode", () => {
    const { ticketCode, ...rest } = validItem;
    expect(ticketItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid status", () => {
    expect(ticketItemSchema.safeParse({ ...validItem, status: "bogus" }).success).toBe(false);
  });
});

describe("ticketListResponseSchema", () => {
  const validResponse = {
    data: [
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        ticketCode: "TKT000001",
        qrToken: null,
        status: "paid",
        purchasedAt: null,
        createdAt: "2026-07-10T12:00:00Z",
        ticketType: { id: "tt-1", name: "General", price: 50000 },
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
  };

  it("accepts valid response", () => {
    expect(ticketListResponseSchema.safeParse(validResponse).success).toBe(true);
  });

  it("accepts empty data", () => {
    expect(ticketListResponseSchema.safeParse({ ...validResponse, data: [], total: 0 }).success).toBe(true);
  });

  it("rejects negative total", () => {
    expect(ticketListResponseSchema.safeParse({ ...validResponse, total: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(ticketListResponseSchema.safeParse({ ...validResponse, page: 0 }).success).toBe(false);
  });
});
