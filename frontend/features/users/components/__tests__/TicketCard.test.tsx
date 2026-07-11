import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { TicketCard } from "../TicketCard";
import { createMockTicket } from "./mock-tickets";

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

describe("TicketCard", () => {
  it("renders ticket type name correctly", () => {
    const ticket = createMockTicket();
    renderWithProviders(<TicketCard ticket={ticket} />);
    expect(screen.getAllByText("General").length).toBeGreaterThanOrEqual(1);
  });

  it("renders status badge with correct text", () => {
    const ticket = createMockTicket({ status: "paid" });
    renderWithProviders(<TicketCard ticket={ticket} />);
    expect(screen.getAllByText("Pagada").length).toBeGreaterThanOrEqual(1);
  });

  it("renders price formatted in COP", () => {
    const ticket = createMockTicket();
    renderWithProviders(<TicketCard ticket={ticket} />);
    expect(
      screen.getByText((content) => content.includes("500")),
    ).toBeDefined();
  });

  it("toggles QR expand on click", async () => {
    const ticket = createMockTicket();
    const user = userEvent.setup();
    const { container } = renderWithProviders(<TicketCard ticket={ticket} />);

    const card = container.firstElementChild!;
    await user.click(card);

    expect(screen.getByText("Descargar QR")).toBeDefined();
  });

  it("shows QR no disponible when qrToken is null", async () => {
    const ticket = createMockTicket({ qrToken: null });
    const user = userEvent.setup();
    const { container } = renderWithProviders(<TicketCard ticket={ticket} />);

    const card = container.firstElementChild!;
    await user.click(card);

    expect(screen.getByText("QR no disponible")).toBeDefined();
  });
});
