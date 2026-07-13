import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TestWrapper } from "@/test/test-utils";
import { PaymentsList } from "../PaymentsList";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockPaymentsData = {
  data: [
    {
      id: "p1",
      amountCents: 500000,
      status: "completed",
      provider: "mercadopago",
      providerTxId: "mp123",
      createdAt: "2026-06-01T00:00:00Z",
      updatedAt: "2026-06-01T00:00:00Z",
      user: { id: "u1", email: "ana@test.com", fullName: "Ana Pérez" },
      ticketCount: 2,
    },
  ],
  total: 1,
  page: 1,
  limit: 25,
};

vi.mock("../../api/admin-payments.queries", () => ({
  usePayments: () => ({
    data: mockPaymentsData,
    isLoading: false,
    isError: false,
  }),
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PaymentsList />
    </QueryClientProvider>,
    { wrapper: TestWrapper },
  );
}

describe("PaymentsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading", () => {
    renderPage();
    expect(screen.getByText("Pagos")).toBeInTheDocument();
  });

  it("renders payment rows from data", () => {
    renderPage();
    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    expect(screen.getByText(/5\.000/)).toBeInTheDocument();
  });

  it("shows pagination info", () => {
    renderPage();
    expect(screen.getByText(/1 pago/)).toBeInTheDocument();
    expect(screen.getByText(/Página 1 de 1/)).toBeInTheDocument();
  });
});
