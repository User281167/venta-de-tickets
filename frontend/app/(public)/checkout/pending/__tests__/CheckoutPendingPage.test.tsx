import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/components/ui/theme";
import CheckoutPendingPage from "../page";

const mockSearchParams = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams(),
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}

describe("CheckoutPendingPage", () => {
  beforeEach(() => {
    mockSearchParams.mockReset();
  });

  it("renders pending message", () => {
    mockSearchParams.mockReturnValue(new URLSearchParams(""));

    render(<CheckoutPendingPage />, { wrapper: TestWrapper });

    expect(screen.getByText("Pago pendiente")).toBeInTheDocument();
  });

  it("renders status when present", () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams("collection_status=pending"),
    );

    render(<CheckoutPendingPage />, { wrapper: TestWrapper });

    expect(screen.getByText("Estado: pending")).toBeInTheDocument();
  });

  it("renders back link", () => {
    mockSearchParams.mockReturnValue(new URLSearchParams(""));

    render(<CheckoutPendingPage />, { wrapper: TestWrapper });

    expect(screen.getByText("Volver a entradas")).toBeInTheDocument();
  });

  it("renders cash payment instruction", () => {
    mockSearchParams.mockReturnValue(new URLSearchParams(""));

    render(<CheckoutPendingPage />, { wrapper: TestWrapper });

    expect(
      screen.getByText(/puede tardar hasta 24 horas hábiles/),
    ).toBeInTheDocument();
  });
});
