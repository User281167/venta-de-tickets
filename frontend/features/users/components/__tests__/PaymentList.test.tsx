import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { PaymentList } from "../PaymentList";
import { createMockPayment, createMockPaymentList } from "./mock-payments";

vi.mock("../../hooks/usePayments", () => ({
  useMyPayments: vi.fn(),
}));

import { useMyPayments } from "../../hooks/usePayments";

const mockUseMyPayments = useMyPayments as ReturnType<typeof vi.fn>;

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

describe("PaymentList", () => {
  beforeEach(() => {
    mockUseMyPayments.mockReset();
  });

  it("shows loading skeleton while fetching", () => {
    mockUseMyPayments.mockReturnValue({ data: undefined, isLoading: true, error: null });

    renderWithProviders(<PaymentList />);
    const skeletons = document.querySelectorAll("div.chakra-skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows empty state when no payments", () => {
    mockUseMyPayments.mockReturnValue({
      data: createMockPaymentList(0),
      isLoading: false,
      error: null,
    });

    renderWithProviders(<PaymentList />);
    expect(screen.getByText("No hay pagos registrados")).toBeDefined();
  });

  it("renders payment rows when data exists", () => {
    mockUseMyPayments.mockReturnValue({
      data: createMockPaymentList(2),
      isLoading: false,
      error: null,
    });

    renderWithProviders(<PaymentList />);
    expect(screen.getByText("Historial de pagos")).toBeDefined();
  });

  it("renders single payment with correct provider label", () => {
    mockUseMyPayments.mockReturnValue({
      data: { data: [createMockPayment({ provider: "mercadopago" })], total: 1, page: 1, limit: 20 },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<PaymentList />);
    expect(screen.getAllByText("Mercado Pago").length).toBeGreaterThanOrEqual(1);
  });

  it("shows the unfulfillable warning when payment status is completed_unfulfillable", () => {
    mockUseMyPayments.mockReturnValue({
      data: {
        data: [
          createMockPayment({
            status: "completed_unfulfillable",
            tickets: [],
          }),
        ],
        total: 1,
        page: 1,
        limit: 20,
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<PaymentList />);
    expect(
      screen.getByText("Pago aprobado sin entradas emitidas"),
    ).toBeInTheDocument();
  });
});
