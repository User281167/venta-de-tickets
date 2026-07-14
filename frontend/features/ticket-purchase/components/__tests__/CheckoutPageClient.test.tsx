import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/components/ui/theme";
import { CartProvider } from "@/providers/CartProvider";
import { CheckoutPageClient } from "../CheckoutPageClient";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockMutate = vi.fn();
const mockReset = vi.fn();

const mockMutationState = vi.hoisted(() => ({
  data: null as { preferenceId: string } | null,
  error: null,
  isPending: false,
}));

vi.mock("@/features/ticket-purchase/api/checkout.queries", () => ({
  useCreateCheckoutPreference: () => ({
    mutate: mockMutate,
    data: mockMutationState.data,
    error: mockMutationState.error,
    isPending: mockMutationState.isPending,
    reset: mockReset,
  }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <CartProvider>{children}</CartProvider>
    </ChakraProvider>
  );
}

beforeEach(() => {
  mockPush.mockClear();
  mockMutate.mockClear();
  mockReset.mockClear();
  mockMutationState.data = null;
  mockMutationState.error = null;
  mockMutationState.isPending = false;
  vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});
});

describe("CheckoutPageClient", () => {
  it("renders items list and OrderSummary when cart has items", async () => {
    vi.restoreAllMocks();

    const store: Record<string, string> = {};
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key: string) => store[key] ?? null,
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      (key: string, value: string) => {
        store[key] = value;
      },
    );

    store["cart-current-event"] = JSON.stringify([
      {
        ticketTypeId: "tt-1",
        name: "General",
        unitPriceCents: 50000,
        quantity: 2,
        maxPerUser: 4,
        availableStock: 100,
      },
    ]);

    render(<CheckoutPageClient />, { wrapper: Wrapper });

    const items = screen.getAllByText("General");
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Resumen del pedido")).toBeInTheDocument();
  });

  it("renders Wallet button container when mutation has data", async () => {
    vi.restoreAllMocks();

    const store: Record<string, string> = {};
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key: string) => store[key] ?? null,
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      (key: string, value: string) => {
        store[key] = value;
      },
    );

    store["cart-current-event"] = JSON.stringify([
      {
        ticketTypeId: "tt-1",
        name: "VIP",
        unitPriceCents: 100000,
        quantity: 1,
        maxPerUser: 2,
        availableStock: 50,
      },
    ]);

    mockMutationState.data = { preferenceId: "pref-456" };

    render(<CheckoutPageClient />, { wrapper: Wrapper });

    await vi.waitFor(() => {
      expect(screen.getByTestId("mp-wallet-container")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("redirects to /entradas when cart is empty", async () => {
    render(<CheckoutPageClient />, { wrapper: Wrapper });

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/entradas");
    });
  });
});
