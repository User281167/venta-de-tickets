import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TestWrapper } from "@/test/test-utils";
import { PaymentDetail } from "../PaymentDetail";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "p1" }),
  useRouter: () => ({ push: vi.fn() }),
}));

const mockDetail = {
  id: "p1",
  userId: "u1",
  amountCents: 500000,
  status: "completed",
  provider: "mercadopago",
  providerTxId: "mp123",
  createdAt: "2026-06-01T00:00:00Z",
  updatedAt: "2026-06-01T00:00:00Z",
  user: { id: "u1", email: "ana@test.com", fullName: "Ana Pérez" },
  tickets: [
    {
      id: "t1",
      ticketCode: "abc123def456",
      status: "paid",
      ticketType: { id: "tt1", name: "Entrada General", price: "50.00" },
    },
  ],
};

vi.mock("../../api/admin-payments.queries", () => ({
  usePaymentDetail: () => ({
    data: mockDetail,
    isLoading: false,
    isError: false,
  }),
  useProcessRefund: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PaymentDetail />
    </QueryClientProvider>,
    { wrapper: TestWrapper },
  );
}

describe("PaymentDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders payment info", () => {
    renderPage();
    expect(screen.getByText("Detalle del pago")).toBeInTheDocument();
  });

  it("renders user info", () => {
    renderPage();
    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    expect(screen.getByText("ana@test.com")).toBeInTheDocument();
  });

  it("renders tickets", () => {
    renderPage();
    expect(screen.getByText("Entrada General")).toBeInTheDocument();
  });

  it("shows refund button for completed payment", () => {
    renderPage();
    expect(screen.getByText("Reembolsar")).toBeInTheDocument();
  });

  it("renders formatted currency for total", () => {
    renderPage();
    expect(screen.getByText(/5\.000/)).toBeInTheDocument();
  });
});
