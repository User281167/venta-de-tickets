"use client";

import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TicketActionsMenu } from "../TicketActionsMenu";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import type { TicketItem } from "../../types/ticket.types";

function makeTicket(overrides?: Partial<TicketItem>): TicketItem {
  return {
    id: "ticket-1",
    ticketCode: "TKT000001",
    qrToken: "qr-1",
    status: "pending_confirmation",
    purchasedAt: null,
    createdAt: new Date().toISOString(),
    ticketType: { id: "tt-1", name: "General" },
    ...overrides,
  };
}

function renderWithChakra(ui: React.ReactNode) {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
}

describe("TicketActionsMenu", () => {
  it("returns null for non-pending tickets", () => {
    const onConfirm = vi.fn();
    const onReject = vi.fn();
    const { container } = renderWithChakra(
      <TicketActionsMenu
        ticket={makeTicket({ status: "paid" })}
        onConfirm={onConfirm}
        onReject={onReject}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders the trigger button for pending_confirmation tickets", () => {
    renderWithChakra(
      <TicketActionsMenu
        ticket={makeTicket()}
        onConfirm={vi.fn()}
        onReject={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /acciones del ticket/i }),
    ).toBeInTheDocument();
  });

  it("opens menu and calls onConfirm with ticket id", async () => {
    const onConfirm = vi.fn();
    const onReject = vi.fn();

    renderWithChakra(
      <TicketActionsMenu
        ticket={makeTicket()}
        onConfirm={onConfirm}
        onReject={onReject}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /acciones del ticket/i }),
    );

    const confirmItem = await screen.findByText(/confirmar ingreso/i);
    fireEvent.click(confirmItem);

    expect(onConfirm).toHaveBeenCalledWith("ticket-1");
    expect(onReject).not.toHaveBeenCalled();
  });

  it("opens menu and calls onReject with ticket id", async () => {
    const onConfirm = vi.fn();
    const onReject = vi.fn();

    renderWithChakra(
      <TicketActionsMenu
        ticket={makeTicket()}
        onConfirm={onConfirm}
        onReject={onReject}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /acciones del ticket/i }),
    );

    const rejectItem = await screen.findByText(/rechazar ingreso/i);
    fireEvent.click(rejectItem);

    expect(onReject).toHaveBeenCalledWith("ticket-1");
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
