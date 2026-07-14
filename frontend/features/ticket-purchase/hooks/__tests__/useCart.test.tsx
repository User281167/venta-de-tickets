import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/components/ui/theme";
import { CartProvider } from "@/providers/CartProvider";
import { TicketTypeGrid } from "../../components/TicketTypeGrid";
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

const vip: TicketType = {
  id: "tt-2",
  name: "VIP",
  description: "Acceso VIP",
  price: 120000,
  availableCount: 10,
  maxPerUser: 2,
  saleEndsAt: null,
  isSoldOut: false,
  isActive: true,
};

function CartTestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <CartProvider>{children}</CartProvider>
    </ChakraProvider>
  );
}

describe("useCart integration with TicketTypeGrid", () => {
  beforeEach(() => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows Agregar button for ticket types not in cart", () => {
    render(<TicketTypeGrid ticketTypes={[general]} />, {
      wrapper: CartTestWrapper,
    });

    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /agregar/i })).toBeInTheDocument();
  });

  it("add button disappears after clicking", async () => {
    const user = userEvent.setup();
    render(<TicketTypeGrid ticketTypes={[general]} />, {
      wrapper: CartTestWrapper,
    });

    await user.click(screen.getByRole("button", { name: /agregar/i }));
    expect(screen.queryByRole("button", { name: /agregar/i })).not.toBeInTheDocument();
  });

  it("supports adding multiple ticket types independently", async () => {
    const user = userEvent.setup();
    render(<TicketTypeGrid ticketTypes={[general, vip]} />, {
      wrapper: CartTestWrapper,
    });

    const addButtons = screen.getAllByRole("button", { name: /agregar/i });
    expect(addButtons).toHaveLength(2);

    await user.click(addButtons[0]);

    expect(screen.getAllByRole("button", { name: /agregar/i })).toHaveLength(1);
  });

  it("allows add then remove by clicking decrement button", async () => {
    const user = userEvent.setup();
    render(<TicketTypeGrid ticketTypes={[general]} />, {
      wrapper: CartTestWrapper,
    });

    await user.click(screen.getByRole("button", { name: /agregar/i }));
    expect(screen.queryByRole("button", { name: /agregar/i })).not.toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    const enabledBtn = buttons.find((b) => !b.hasAttribute("disabled"));
    if (enabledBtn) {
      await user.click(enabledBtn);
    }

    expect(screen.getByRole("button", { name: /agregar/i })).toBeInTheDocument();
  });

  it("shows empty state for no ticket types", () => {
    render(<TicketTypeGrid ticketTypes={[]} />, {
      wrapper: CartTestWrapper,
    });

    expect(
      screen.getByText("No hay tipos de entrada disponibles"),
    ).toBeInTheDocument();
  });

  it("persists cart across unmount/remount via localStorage", async () => {
    const user = userEvent.setup();
    const store: Record<string, string> = {};

    vi.restoreAllMocks();

    const getItemSpy = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation((key: string) => store[key] ?? null);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      (key: string, value: string) => {
        store[key] = value;
      },
    );
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {});

    render(<TicketTypeGrid ticketTypes={[general]} />, {
      wrapper: CartTestWrapper,
    });

    expect(
      screen.getByRole("button", { name: /agregar/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /agregar/i }));
    expect(store["cart-current-event"]).toBeDefined();

    cleanup();

    render(<TicketTypeGrid ticketTypes={[general]} />, {
      wrapper: CartTestWrapper,
    });

    expect(
      screen.queryByRole("button", { name: /agregar/i }),
    ).not.toBeInTheDocument();
  });
});
