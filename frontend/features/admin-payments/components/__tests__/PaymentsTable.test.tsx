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
    amountCents: 500000,
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
    amountCents: 250000,
    status: "refunded",
    provider: "mercadopago",
    providerTxId: null,
    createdAt: "2026-05-15T00:00:00Z",
    updatedAt: "2026-05-20T00:00:00Z",
    user: { id: "u2", email: "luis@test.com", fullName: "Luis Gómez" },
    ticketCount: 1,
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
});
