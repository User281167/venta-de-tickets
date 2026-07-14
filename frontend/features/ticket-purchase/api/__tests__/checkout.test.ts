import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCheckoutPreference, CheckoutError } from "../checkout.api";

const mockGetSession = vi.fn();

vi.mock("@/shared/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getSession: () => mockGetSession() },
  }),
}));

const MOCK_RESPONSE = {
  paymentId: "pay-123",
  checkoutUrl: "https://mp.com/checkout",
  preferenceId: "pref-456",
};

const MOCK_ITEMS = [{ ticketTypeId: "tt-1", quantity: 2 }];
const MOCK_BACK_URL = "https://example.com/checkout/success";

beforeEach(() => {
  vi.restoreAllMocks();
  mockGetSession.mockResolvedValue({
    data: { session: { access_token: "mock-token" } },
  });
});

describe("createCheckoutPreference", () => {
  it("returns parsed response on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => MOCK_RESPONSE,
    } as Response);

    const result = await createCheckoutPreference(MOCK_ITEMS, MOCK_BACK_URL);

    expect(result).toEqual(MOCK_RESPONSE);
  });

  it("includes Authorization header with Bearer token", async () => {
    let authHeader: string | null = null;

    vi.spyOn(globalThis, "fetch").mockImplementation(async (url, opts) => {
      authHeader = (opts as RequestInit).headers?.["Authorization"] as string;
      return { ok: true, json: async () => MOCK_RESPONSE } as Response;
    });

    await createCheckoutPreference(MOCK_ITEMS, MOCK_BACK_URL);
    expect(authHeader).toBe("Bearer mock-token");
  });

  it("sends items, backUrl, and provider in request body", async () => {
    let sentBody: string | null = null;

    vi.spyOn(globalThis, "fetch").mockImplementation(async (url, opts) => {
      sentBody = (opts as RequestInit).body as string;
      return { ok: true, json: async () => MOCK_RESPONSE } as Response;
    });

    await createCheckoutPreference(MOCK_ITEMS, MOCK_BACK_URL);

    const parsed = JSON.parse(sentBody!);
    expect(parsed.items).toEqual(MOCK_ITEMS);
    expect(parsed.backUrl).toBe(MOCK_BACK_URL);
    expect(parsed.provider).toBe("mercadopago");
  });

  it("throws CheckoutError with mapped message on validation error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        error: { code: "MAX_PER_USER_EXCEEDED" },
      }),
    } as Response);

    await expect(
      createCheckoutPreference(MOCK_ITEMS, MOCK_BACK_URL),
    ).rejects.toThrow(CheckoutError);

    await expect(
      createCheckoutPreference(MOCK_ITEMS, MOCK_BACK_URL),
    ).rejects.toThrow("Has excedido el límite por usuario");
  });

  it("throws CheckoutError when no session token", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    await expect(
      createCheckoutPreference(MOCK_ITEMS, MOCK_BACK_URL),
    ).rejects.toThrow(CheckoutError);

    await expect(
      createCheckoutPreference(MOCK_ITEMS, MOCK_BACK_URL),
    ).rejects.toThrow("No autenticado");
  });
});
