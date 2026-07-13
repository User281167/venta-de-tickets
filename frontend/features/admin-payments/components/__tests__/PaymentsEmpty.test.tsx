import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestWrapper } from "@/test/test-utils";
import { PaymentsEmpty } from "../PaymentsEmpty";

describe("PaymentsEmpty", () => {
  it("renders empty message", () => {
    render(<PaymentsEmpty />, { wrapper: TestWrapper });
    expect(screen.getByText("No se encontraron pagos")).toBeInTheDocument();
  });

  it("renders filter hint", () => {
    render(<PaymentsEmpty />, { wrapper: TestWrapper });
    expect(screen.getByText(/ajustar los filtros/i)).toBeInTheDocument();
  });
});
