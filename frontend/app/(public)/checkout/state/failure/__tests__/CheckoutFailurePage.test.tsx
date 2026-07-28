import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/components/ui/theme";
import CheckoutFailurePage from "../page";

const mockSearchParams = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams(),
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}

describe("CheckoutFailurePage", () => {
  beforeEach(() => {
    mockSearchParams.mockReset();
  });

  it("renders failure message", () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams("collection_status=rejected"),
    );

    render(<CheckoutFailurePage />, { wrapper: TestWrapper });

    expect(screen.getByText("Pago rechazado")).toBeInTheDocument();
  });

  it("renders reason when collection_status is known", () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams("collection_status=cc_rejected"),
    );

    render(<CheckoutFailurePage />, { wrapper: TestWrapper });

    expect(screen.getByText("Tarjeta rechazada")).toBeInTheDocument();
  });

  it("renders generic message when no collection_status", () => {
    mockSearchParams.mockReturnValue(new URLSearchParams(""));

    render(<CheckoutFailurePage />, { wrapper: TestWrapper });

    expect(
      screen.getByText("No se pudo completar el pago"),
    ).toBeInTheDocument();
  });

  it("renders retry link", () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams("collection_status=rejected"),
    );

    render(<CheckoutFailurePage />, { wrapper: TestWrapper });

    expect(screen.getByText("Intentar de nuevo")).toBeInTheDocument();
  });
});
