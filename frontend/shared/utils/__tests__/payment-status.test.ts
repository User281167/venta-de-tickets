import { describe, it, expect } from "vitest";
import {
  canRefund,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_FILTER_OPTIONS,
  PAYMENT_STATUS_VALUES,
  type PaymentStatus,
} from "./payment-status";

describe("canRefund", () => {
  it("returns true for completed", () => {
    expect(canRefund("completed")).toBe(true);
  });

  it("returns true for completed_unfulfillable", () => {
    expect(canRefund("completed_unfulfillable")).toBe(true);
  });

  it("returns false for pending", () => {
    expect(canRefund("pending")).toBe(false);
  });

  it("returns false for failed", () => {
    expect(canRefund("failed")).toBe(false);
  });

  it("returns false for refunded", () => {
    expect(canRefund("refunded")).toBe(false);
  });

  it("returns false for expired", () => {
    expect(canRefund("expired")).toBe(false);
  });

  it("returns false for unknown status", () => {
    expect(canRefund("weird_state")).toBe(false);
  });
});

describe("STATUS_COLORS / STATUS_LABELS", () => {
  it("has an entry for every payment status value", () => {
    for (const s of PAYMENT_STATUS_VALUES) {
      expect(STATUS_COLORS[s]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(STATUS_LABELS[s]).toBeTruthy();
    }
  });

  it("includes expired and completed_unfulfillable", () => {
    expect(STATUS_LABELS.expired).toBe("Expirado");
    expect(STATUS_LABELS.completed_unfulfillable).toBe("Pago sin entradas");
  });
});

describe("STATUS_FILTER_OPTIONS", () => {
  it("starts with the all-states entry", () => {
    expect(STATUS_FILTER_OPTIONS[0]).toEqual({
      value: "",
      label: "Todos los estados",
    });
  });

  it("covers every status", () => {
    const values = STATUS_FILTER_OPTIONS.map((o) => o.value).filter(Boolean);
    const expected: PaymentStatus[] = [
      "pending",
      "completed",
      "failed",
      "refunded",
      "expired",
      "completed_unfulfillable",
    ];
    for (const s of expected) {
      expect(values).toContain(s);
    }
  });
});
