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

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("../../api/checkout.queries", () => ({
  useCreateCheckoutPreference: () => ({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    mutate: mockMutate,
    reset: vi.fn(),
  }),
}));

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

describe("CheckoutPageClient", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    vi.clearAllMocks();
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

  it("renders items list, OrderSummary, and Pagar button when cart has items", async () => {
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
    expect(screen.getByTestId("pagar-mp-button")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("redirects to /entradas when cart is empty", async () => {
    render(<CheckoutPageClient />, { wrapper: Wrapper });

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/entradas");
    });
  });
});
