import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestWrapper } from "@/test/test-utils";
import { BatchResultSummary } from "../BatchResultSummary";

describe("BatchResultSummary", () => {
  it("shows success message with created count", () => {
    render(
      <BatchResultSummary
        result={{ status: "success", createdCount: 3 }}
        onReset={() => {}}
      />,
      { wrapper: TestWrapper },
    );

    expect(screen.getByText("3 usuarios creados exitosamente")).toBeInTheDocument();
    expect(screen.getByText("Volver")).toBeInTheDocument();
  });

  it("shows singular success message for one user", () => {
    render(
      <BatchResultSummary
        result={{ status: "success", createdCount: 1 }}
        onReset={() => {}}
      />,
      { wrapper: TestWrapper },
    );

    expect(screen.getByText("1 usuario creado exitosamente")).toBeInTheDocument();
  });

  it("shows conflict message with emails", () => {
    render(
      <BatchResultSummary
        result={{
          status: "conflict",
          conflicts: { emails: ["user1@test.com", "user2@test.com"], cedulas: [] },
        }}
        onReset={() => {}}
      />,
      { wrapper: TestWrapper },
    );

    expect(screen.getByText("Conflictos encontrados")).toBeInTheDocument();
    expect(screen.getByText("Correos electrónicos en conflicto")).toBeInTheDocument();
    expect(screen.getByText(/user1@test\.com/)).toBeInTheDocument();
    expect(screen.getByText(/user2@test\.com/)).toBeInTheDocument();
  });

  it("shows conflict message with cedulas", () => {
    render(
      <BatchResultSummary
        result={{
          status: "conflict",
          conflicts: { emails: [], cedulas: ["12345678"] },
        }}
        onReset={() => {}}
      />,
      { wrapper: TestWrapper },
    );

    expect(screen.getByText("Cédulas en conflicto")).toBeInTheDocument();
    expect(screen.getByText(/12345678/)).toBeInTheDocument();
  });

  it("shows error message with retry button", () => {
    const onReset = vi.fn();

    render(
      <BatchResultSummary
        result={{
          status: "error",
          errorMessage: "Error de conexión",
        }}
        onReset={onReset}
      />,
      { wrapper: TestWrapper },
    );

    expect(screen.getByText("Error al enviar")).toBeInTheDocument();
    expect(screen.getByText("Error de conexión")).toBeInTheDocument();
    expect(screen.getByText("Reintentar")).toBeInTheDocument();
  });

  it("calls onReset when Volver or Reintentar clicked", async () => {
    const onReset = vi.fn();
    const user = userEvent.setup();

    render(
      <BatchResultSummary
        result={{ status: "error", errorMessage: "Error" }}
        onReset={onReset}
      />,
      { wrapper: TestWrapper },
    );

    await user.click(screen.getByText("Reintentar"));
    expect(onReset).toHaveBeenCalledTimes(1);

    await user.click(screen.getByText("Volver"));
    expect(onReset).toHaveBeenCalledTimes(2);
  });

  it("does not show Reintentar for success", () => {
    render(
      <BatchResultSummary
        result={{ status: "success", createdCount: 1 }}
        onReset={() => {}}
      />,
      { wrapper: TestWrapper },
    );

    expect(screen.queryByText("Reintentar")).not.toBeInTheDocument();
  });

  it("does not show Reintentar for conflict", () => {
    render(
      <BatchResultSummary
        result={{
          status: "conflict",
          conflicts: { emails: ["e@test.com"], cedulas: [] },
        }}
        onReset={() => {}}
      />,
      { wrapper: TestWrapper },
    );

    expect(screen.queryByText("Reintentar")).not.toBeInTheDocument();
  });
});
