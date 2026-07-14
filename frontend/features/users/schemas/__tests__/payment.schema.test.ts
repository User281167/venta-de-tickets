import { describe, it, expect } from "vitest";
import { paymentItemSchema, paymentListResponseSchema, paymentStatusSchema } from "../payment.schema";

describe("paymentStatusSchema", () => {
  it("accepts valid statuses", () => {
    expect(paymentStatusSchema.safeParse("pending").success).toBe(true);
    expect(paymentStatusSchema.safeParse("completed").success).toBe(true);
    expect(paymentStatusSchema.safeParse("failed").success).toBe(true);
    expect(paymentStatusSchema.safeParse("refunded").success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = paymentStatusSchema.safeParse("cancelled");
    expect(result.success).toBe(false);
  });
});

describe("paymentItemSchema", () => {
  const validItem = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    provider: "mercadopago",
    subtotalCents: 50000,
    discountCents: 0,
    totalCents: 50000,
    status: "completed",
    createdAt: "2026-07-10T12:00:00Z",
    tickets: [
      { id: "ticket-1", ticketCode: "ABC123", status: "paid" },
    ],
  };

  it("accepts valid payment item", () => {
    const result = paymentItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("accepts payment with no tickets", () => {
    const result = paymentItemSchema.safeParse({ ...validItem, tickets: [] });
    expect(result.success).toBe(true);
  });

  it("rejects negative totalCents", () => {
    const result = paymentItemSchema.safeParse({ ...validItem, totalCents: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects missing provider", () => {
    const { provider, ...rest } = validItem;
    const result = paymentItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects non-integer totalCents", () => {
    const result = paymentItemSchema.safeParse({ ...validItem, totalCents: 50.5 });
    expect(result.success).toBe(false);
  });
});

describe("paymentListResponseSchema", () => {
  const validResponse = {
    data: [
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        provider: "mercadopago",
        subtotalCents: 50000,
        discountCents: 0,
        totalCents: 50000,
        status: "completed",
        createdAt: "2026-07-10T12:00:00Z",
        tickets: [],
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
  };

  it("accepts valid response", () => {
    const result = paymentListResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = paymentListResponseSchema.safeParse({ ...validResponse, total: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const result = paymentListResponseSchema.safeParse({ ...validResponse, limit: 0 });
    expect(result.success).toBe(false);
  });

  it("accepts empty data array", () => {
    const result = paymentListResponseSchema.safeParse({ ...validResponse, data: [], total: 0 });
    expect(result.success).toBe(true);
  });
});
