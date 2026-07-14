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

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <CartProvider>{children}</CartProvider>
    </ChakraProvider>
  );
}

describe("Checkout flow", () => {
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

  it("renders items and OrderSummary with items in cart", async () => {
    store["cart-current-event"] = JSON.stringify(CART_ITEMS);

    render(<CheckoutPageClient />, { wrapper: Wrapper });

    await screen.findByText("Revisa tu pedido");

    expect(screen.getAllByText("VIP").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Resumen del pedido")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("redirects to /entradas when cart is empty", async () => {
    render(<CheckoutPageClient />, { wrapper: Wrapper });

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/entradas");
    });
  });
});
