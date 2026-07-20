import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestWrapper } from "@/test/test-utils";
import { PaymentsTable } from "../PaymentsTable";
import type { PaymentListRow } from "../../schemas/admin-payments.schema";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const payments: PaymentListRow[] = [
  {
    id: "p1",
    subtotalCents: 500000,
    discountCents: 0,
    totalCents: 500000,
    status: "completed",
    provider: "mercadopago",
    providerTxId: "mp123",
    createdAt: "2026-06-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
    user: { id: "u1", email: "ana@test.com", fullName: "Ana Pérez" },
    ticketCount: 2,
  },
  {
    id: "p2",
    subtotalCents: 250000,
    discountCents: 0,
    totalCents: 250000,
    status: "refunded",
    provider: "mercadopago",
    providerTxId: null,
    createdAt: "2026-05-15T00:00:00Z",
    updatedAt: "2026-05-20T00:00:00Z",
    user: { id: "u2", email: "luis@test.com", fullName: "Luis Gómez" },
    ticketCount: 1,
  },
  {
    id: "p3",
    subtotalCents: 100000,
    discountCents: 0,
    totalCents: 100000,
    status: "completed_unfulfillable",
    provider: "mercadopago",
    providerTxId: "mp999",
    createdAt: "2026-05-10T00:00:00Z",
    updatedAt: "2026-05-10T00:00:00Z",
    user: { id: "u3", email: "sofia@test.com", fullName: "Sofía Ruiz" },
    ticketCount: 0,
  },
  {
    id: "p4",
    subtotalCents: 80000,
    discountCents: 0,
    totalCents: 80000,
    status: "expired",
    provider: "mercadopago",
    providerTxId: null,
    createdAt: "2026-05-05T00:00:00Z",
    updatedAt: "2026-05-05T00:00:00Z",
    user: { id: "u4", email: "tom@test.com", fullName: "Tomás Vega" },
    ticketCount: 0,
  },
];

function renderTable() {
  return render(<PaymentsTable payments={payments} />, { wrapper: TestWrapper });
}

describe("PaymentsTable", () => {
  it("renders payment rows", () => {
    renderTable();
    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    expect(screen.getByText("Luis Gómez")).toBeInTheDocument();
  });

  it("renders formatted currency", () => {
    renderTable();
    expect(screen.getByText(/5\.000/)).toBeInTheDocument();
    expect(screen.getByText(/2\.500/)).toBeInTheDocument();
  });

  it("renders status labels in Spanish", () => {
    renderTable();
    expect(screen.getAllByText("Completado").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Reembolsado").length).toBeGreaterThanOrEqual(1);
  });

  it("renders ticket counts", () => {
    renderTable();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders labels for new statuses", () => {
    renderTable();
    expect(screen.getByText("Pago sin entradas")).toBeInTheDocument();
    expect(screen.getByText("Expirado")).toBeInTheDocument();
  });
});
