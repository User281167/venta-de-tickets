import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestWrapper } from "@/test/test-utils";
import type { TicketType } from "../../schemas/ticket-types.schema";

const mockUseAuth = vi.fn();

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/features/tickets/components/TicketSelector", () => ({
  TicketSelector: () => null,
}));

const { TicketTypeCard } = await import("../TicketTypeCard");

const baseTicket: TicketType = {
  id: "tt-1",
  name: "General",
  description: "Entrada general al evento",
  price: 120000,
  availableCount: 400,
  maxPerUser: 4,
  saleEndsAt: null,
  isSoldOut: false,
  isActive: true,
};

describe("TicketTypeCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null });
  });

  it("renders ticket name and price", () => {
    render(<TicketTypeCard ticketType={baseTicket} />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("$120.000")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<TicketTypeCard ticketType={baseTicket} />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText("Entrada general al evento")).toBeInTheDocument();
  });

  it("shows availability count", () => {
    render(<TicketTypeCard ticketType={baseTicket} />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText("400 disponibles")).toBeInTheDocument();
  });

  it("shows Agotado badge and disabled button when sold out", () => {
    render(
      <TicketTypeCard
        ticketType={{ ...baseTicket, availableCount: 0, isSoldOut: true }}
      />,
      { wrapper: TestWrapper },
    );

    const agotados = screen.getAllByText("Agotado");
    expect(agotados.length).toBe(2);
    expect(agotados[0].tagName).toBe("SPAN");
  });

  it("shows maxPerUser when present", () => {
    render(<TicketTypeCard ticketType={baseTicket} />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText("Máx. 4 por persona")).toBeInTheDocument();
  });

  it("shows Inicia sesión button when not authenticated", () => {
    mockUseAuth.mockReturnValue({ user: null });

    render(<TicketTypeCard ticketType={baseTicket} />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText("Inicia sesión para comprar")).toBeInTheDocument();
  });

  it("shows Comprar button when authenticated", () => {
    mockUseAuth.mockReturnValue({ user: { id: "u1", email: "test@test.com" } });

    render(<TicketTypeCard ticketType={baseTicket} />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText("Ver ubicación y comprar")).toBeInTheDocument();
  });

  it("shows disabled Agotado button when sold out and authenticated", () => {
    mockUseAuth.mockReturnValue({ user: { id: "u1", email: "test@test.com" } });

    render(
      <TicketTypeCard
        ticketType={{ ...baseTicket, availableCount: 0, isSoldOut: true }}
      />,
      { wrapper: TestWrapper },
    );

    const buttons = screen.getAllByRole("button");
    const agotadoBtn = buttons.find((b) => b.textContent?.includes("Agotado"));
    expect(agotadoBtn).toBeDefined();
    expect(agotadoBtn).toBeDisabled();
  });

  it("does not render description when null", () => {
    render(
      <TicketTypeCard ticketType={{ ...baseTicket, description: null }} />,
      { wrapper: TestWrapper },
    );

    expect(
      screen.queryByText("Entrada general al evento"),
    ).not.toBeInTheDocument();
  });

  it("formats price with Colombian locale", () => {
    render(<TicketTypeCard ticketType={{ ...baseTicket, price: 2500000 }} />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText("$2.500.000")).toBeInTheDocument();
  });
});
