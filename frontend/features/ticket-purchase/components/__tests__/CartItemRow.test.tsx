import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/components/ui/theme";
import { CartItemRow } from "../CartItemRow";
import type { CartItem } from "../../schemas/cart.schema";

const item: CartItem = {
  ticketTypeId: "tt-1",
  name: "General",
  unitPriceCents: 50000,
  quantity: 2,
  maxPerUser: 4,
  availableStock: 100,
};

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}

describe("CartItemRow", () => {
  it("renders item name, unit price, quantity, and line total", () => {
    render(
      <CartItemRow
        item={item}
        onIncrement={() => {}}
        onDecrement={() => {}}
        onRemove={() => {}}
        canIncrement={true}
        canDecrement={true}
      />,
      { wrapper: TestWrapper },
    );

    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("$ 50.000 c/u")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("$ 100.000")).toBeInTheDocument();
  });

  it("calls onIncrement when plus button clicked", async () => {
    const user = userEvent.setup();
    const onIncrement = vi.fn();

    render(
      <CartItemRow
        item={item}
        onIncrement={onIncrement}
        onDecrement={() => {}}
        onRemove={() => {}}
        canIncrement={true}
        canDecrement={true}
      />,
      { wrapper: TestWrapper },
    );

    const buttons = screen.getAllByRole("button");
    const enabledButtons = buttons.filter((b) => !b.hasAttribute("disabled"));
    const plusButton = enabledButtons.find((b) => {
      const html = b.innerHTML;
      return html.includes("plus") || html.includes("Plus");
    });

    if (plusButton) {
      await user.click(plusButton);
      expect(onIncrement).toHaveBeenCalledTimes(1);
    }
  });

  it("calls onDecrement when minus button clicked", async () => {
    const user = userEvent.setup();
    const onDecrement = vi.fn();

    render(
      <CartItemRow
        item={item}
        onIncrement={() => {}}
        onDecrement={onDecrement}
        onRemove={() => {}}
        canIncrement={true}
        canDecrement={true}
      />,
      { wrapper: TestWrapper },
    );

    const buttons = screen.getAllByRole("button");
    const enabledButtons = buttons.filter((b) => !b.hasAttribute("disabled"));
    const minusButton = enabledButtons.find((b) => {
      const html = b.innerHTML;
      return html.includes("minus") || html.includes("Minus");
    });

    if (minusButton) {
      await user.click(minusButton);
      expect(onDecrement).toHaveBeenCalledTimes(1);
    }
  });

  it("calls onRemove when trash button clicked", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(
      <CartItemRow
        item={item}
        onIncrement={() => {}}
        onDecrement={() => {}}
        onRemove={onRemove}
        canIncrement={true}
        canDecrement={true}
      />,
      { wrapper: TestWrapper },
    );

    const buttons = screen.getAllByRole("button");
    const trashButton = buttons.find((b) => {
      const html = b.innerHTML;
      return html.includes("trash") || html.includes("Trash");
    });

    if (trashButton) {
      await user.click(trashButton);
      expect(onRemove).toHaveBeenCalledTimes(1);
    }
  });
});
