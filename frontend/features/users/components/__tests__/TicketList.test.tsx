import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { TicketList } from "../TicketList";
import { createMockTicketList } from "./mock-tickets";

const mockUseConfirmMyTicket = vi.hoisted(() =>
  vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
);
const mockUseRejectMyTicket = vi.hoisted(() =>
  vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
);

vi.mock("../../hooks/useMyTickets", () => ({
  useMyTickets: vi.fn(),
  useConfirmMyTicket: mockUseConfirmMyTicket,
  useRejectMyTicket: mockUseRejectMyTicket,
}));

import { useMyTickets } from "../../hooks/useMyTickets";

const mockUseMyTickets = useMyTickets as ReturnType<typeof vi.fn>;

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <ChakraProvider value={defaultSystem}>
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    </ChakraProvider>,
  );
}

describe("TicketList", () => {
  beforeEach(() => {
    mockUseMyTickets.mockReset();
  });

  it("shows loading skeleton while fetching", () => {
    mockUseMyTickets.mockReturnValue({ data: undefined, isLoading: true, error: null });

    renderWithProviders(<TicketList />);
    const skeletons = document.querySelectorAll("div.chakra-skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows empty state when no tickets", () => {
    mockUseMyTickets.mockReturnValue({
      data: createMockTicketList(0),
      isLoading: false,
      error: null,
    });

    renderWithProviders(<TicketList />);
    expect(screen.getByText("No tienes entradas registradas")).toBeDefined();
  });

  it("renders ticket cards when data exists", () => {
    mockUseMyTickets.mockReturnValue({
      data: createMockTicketList(2),
      isLoading: false,
      error: null,
    });

    renderWithProviders(<TicketList />);
    expect(screen.getByText("Mis Entradas")).toBeDefined();
  });

  it("renders ticket with type name", () => {
    mockUseMyTickets.mockReturnValue({
      data: { data: [createMockTicketList(1).data[0]], total: 1, page: 1, limit: 20 },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<TicketList />);
    expect(screen.getAllByText("Tipo 1").length).toBeGreaterThanOrEqual(1);
  });
});
