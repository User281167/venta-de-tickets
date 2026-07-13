import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestWrapper } from "@/test/test-utils";
import { PaymentFilters } from "../PaymentFilters";

function setup() {
  const onSearchChange = vi.fn();
  const onStatusChange = vi.fn();
  const onDateFromChange = vi.fn();
  const onDateToChange = vi.fn();

  const utils = render(
    <PaymentFilters
      search=""
      status=""
      dateFrom=""
      dateTo=""
      onSearchChange={onSearchChange}
      onStatusChange={onStatusChange}
      onDateFromChange={onDateFromChange}
      onDateToChange={onDateToChange}
    />,
    { wrapper: TestWrapper },
  );

  return { ...utils, onSearchChange, onStatusChange, onDateFromChange, onDateToChange };
}

describe("PaymentFilters", () => {
  it("renders search input", () => {
    setup();
    expect(screen.getByPlaceholderText(/buscar por nombre/i)).toBeInTheDocument();
  });

  it("renders status dropdown", () => {
    setup();
    expect(screen.getByText("Todos los estados")).toBeInTheDocument();
  });

  it("calls onSearchChange when typing", async () => {
    const { onSearchChange } = setup();
    const input = screen.getByPlaceholderText(/buscar por nombre/i);
    await userEvent.type(input, "Ana");
    expect(onSearchChange).toHaveBeenCalledTimes(3);
  });

  it("renders date inputs", () => {
    setup();
    const dateInputs = screen.getAllByRole("textbox");
    expect(dateInputs.length).toBeGreaterThanOrEqual(1);
  });
});
