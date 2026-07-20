import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { system } from "@/components/ui/theme";
import { CartProvider } from "@/providers/CartProvider";
import { CheckoutPageClient } from "../CheckoutPageClient";

const mockPush = vi.fn();
const mockMutate = vi.fn();
const mockReset = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

interface MutationState {
  data?: { preferenceId?: string } | null;
  isPending?: boolean;
  isError?: boolean;
  error?: Error | null;
}

let mockMutationState: MutationState = {};

vi.mock("../../api/checkout.queries", () => ({
  useCreateCheckoutPreference: () => ({
    data: mockMutationState.data ?? undefined,
    isPending: mockMutationState.isPending ?? false,
    isError: mockMutationState.isError ?? false,
    error: mockMutationState.error ?? null,
    mutate: mockMutate,
    reset: mockReset,
  }),
}));

const CART_ITEMS = [
  {
    ticketTypeId: "tt-1",
    name: "General",
    unitPriceCents: 50000,
    quantity: 2,
    maxPerUser: 4,
    availableStock: 100,
  },
  {
    ticketTypeId: "tt-2",
    name: "VIP",
    unitPriceCents: 100000,
    quantity: 1,
    maxPerUser: 2,
    availableStock: 50,
  },
];

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <QueryClientProvider client={queryClient}>
        <CartProvider>{children}</CartProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

describe("Checkout flow", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutationState = {};
    store = {};
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key: string) => store[key] ?? null,
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      (key: string, value: string) => {
        store[key] = value;
      },
    );
  });

  it("renders items, OrderSummary, and Pagar button with items in cart", async () => {
    store["cart-current-event"] = JSON.stringify(CART_ITEMS);

    render(<CheckoutPageClient />, { wrapper: Wrapper });

    await screen.findByText("Revisa tu pedido");

    expect(screen.getAllByText("VIP").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Resumen del pedido")).toBeInTheDocument();
    expect(screen.getByTestId("pagar-mp-button")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("redirects to /entradas when cart is empty", async () => {
    render(<CheckoutPageClient />, { wrapper: Wrapper });

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/entradas");
    });
  });

  it("calls mutate with items when Pagar button clicked", async () => {
    store["cart-current-event"] = JSON.stringify(CART_ITEMS);

    render(<CheckoutPageClient />, { wrapper: Wrapper });

    const btn = await screen.findByTestId("pagar-mp-button");
    await userEvent.click(btn);

    expect(mockMutate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ ticketTypeId: "tt-1", quantity: 2 }),
        expect.objectContaining({ ticketTypeId: "tt-2", quantity: 1 }),
      ]),
    );
  });

  it("renders MpWalletButton when preferenceId is received", async () => {
    mockMutationState = { data: { preferenceId: "pref-abc-123" } };

    store["cart-current-event"] = JSON.stringify(CART_ITEMS);

    render(<CheckoutPageClient />, { wrapper: Wrapper });

    await screen.findByTestId("wallet-section");
    expect(screen.getByTestId("mp-wallet-container")).toBeInTheDocument();
    expect(screen.queryByTestId("pagar-mp-button")).not.toBeInTheDocument();
  });

  it("shows error message and retry button when mutation fails", async () => {
    const { CheckoutError } = await import("../../api/checkout.api");
    mockMutationState = {
      isError: true,
      error: new CheckoutError("INTERNAL_ERROR", "Error de conexión"),
    };

    store["cart-current-event"] = JSON.stringify(CART_ITEMS);

    render(<CheckoutPageClient />, { wrapper: Wrapper });

    expect(await screen.findByText("Error de conexión")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
    expect(screen.queryByTestId("pagar-mp-button")).not.toBeInTheDocument();
  });
});
