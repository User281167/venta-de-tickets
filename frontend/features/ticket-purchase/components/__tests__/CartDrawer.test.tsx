import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useEffect } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/components/ui/theme";
import { CartProvider } from "@/providers/CartProvider";
import { useCart } from "../../hooks/useCart";
import { CartDrawer } from "../CartDrawer";
import type { TicketType } from "@/features/ticket-types/schemas/ticket-types.schema";

const general: TicketType = {
  id: "tt-1",
  name: "General",
  description: "Entrada general",
  price: 50000,
  availableCount: 100,
  maxPerUser: 4,
  saleEndsAt: null,
  isSoldOut: false,
  isActive: true,
};

function AddItemHelper({ ticketType }: { ticketType: TicketType }) {
  const { addItem } = useCart();
  useEffect(() => {
    addItem(ticketType);
  }, []);
  return null;
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <CartProvider>{children}</CartProvider>
    </ChakraProvider>
  );
}

describe("CartDrawer", () => {
  beforeEach(() => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows empty state when cart has no items", () => {
    render(<CartDrawer open={true} onClose={() => {}} />, {
      wrapper: Wrapper,
    });

    expect(
      screen.getByText("No has seleccionado entradas"),
    ).toBeInTheDocument();
  });

  it("shows items that are in the cart", () => {
    render(
      <>
        <AddItemHelper ticketType={general} />
        <CartDrawer open={true} onClose={() => {}} />
      </>,
      { wrapper: Wrapper },
    );

    const names = screen.getAllByText("General");
    expect(names.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("$50.000 c/u")).toBeInTheDocument();
  });

  it("shows total in footer", () => {
    render(
      <>
        <AddItemHelper ticketType={general} />
        <CartDrawer open={true} onClose={() => {}} />
      </>,
      { wrapper: Wrapper },
    );

    const totals = screen.getAllByText("Total");
    expect(totals.length).toBeGreaterThanOrEqual(1);
  });

  it("calls onClose when close trigger is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<CartDrawer open={true} onClose={onClose} />, {
      wrapper: Wrapper,
    });

    const buttons = screen.getAllByRole("button");
    const closeButton = buttons.find(
      (b) => b.getAttribute("data-part") === "close-trigger",
    );

    expect(closeButton).toBeDefined();
    if (closeButton) {
      await user.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });
});
