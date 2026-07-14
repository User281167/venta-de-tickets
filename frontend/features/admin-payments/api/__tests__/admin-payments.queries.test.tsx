import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePayments, usePaymentDetail, useProcessRefund } from "../admin-payments.queries";
import type { ReactNode } from "react";

vi.mock("@/shared/api/admin-fetch", () => ({
  authFetch: vi.fn(),
}));

import { authFetch } from "@/shared/api/admin-fetch";

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("usePayments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches payments with filters", async () => {
    const mockData = { data: [], total: 0, page: 1, limit: 25 };
    vi.mocked(authFetch).mockResolvedValue(mockData);

    const { result } = renderHook(
      () => usePayments({ page: 1, limit: 25 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });
});

describe("usePaymentDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches payment detail by id", async () => {
    const mockDetail = { id: "p1", subtotalCents: 5000, discountCents: 0, totalCents: 5000, status: "completed", provider: "mp", providerTxId: null, createdAt: "", updatedAt: "", userId: "u1", user: { id: "u1", email: "a@b.com", fullName: "Ana" }, tickets: [] };
    vi.mocked(authFetch).mockResolvedValue(mockDetail);

    const { result } = renderHook(
      () => usePaymentDetail("p1"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockDetail);
  });
});

describe("useProcessRefund", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls authFetch with POST and correct body", async () => {
    const mockRefund = { paymentId: "p1", status: "refunded" };
    vi.mocked(authFetch).mockResolvedValue(mockRefund);

    const { result } = renderHook(
      () => useProcessRefund("p1"),
      { wrapper: createWrapper() },
    );

    result.current.mutate({ reason: "Test refund reason" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authFetch).toHaveBeenCalledWith(
      "/api/admin/payments/p1/refund",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Test refund reason" }),
      }),
    );
  });
});
