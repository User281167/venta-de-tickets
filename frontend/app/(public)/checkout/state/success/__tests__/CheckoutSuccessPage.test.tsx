import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/components/ui/theme";
import CheckoutSuccessPage from "../page";

const mockSearchParams = vi.fn();
const mockClearCart = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams(),
}));

vi.mock("@/features/ticket-purchase/hooks/useCart", () => ({
  useCart: () => ({ clearCart: mockClearCart }),
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}

describe("CheckoutSuccessPage", () => {
  beforeEach(() => {
    mockSearchParams.mockReset();
    mockClearCart.mockReset();
  });

  it("renders success message and payment ID", async () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams("collection_status=approved&payment_id=123"),
    );

    render(<CheckoutSuccessPage />, { wrapper: TestWrapper });

    expect(screen.getByText("Pago exitoso")).toBeInTheDocument();
    expect(screen.getByText("ID de transacción")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
  });

  it("renders external reference when present", () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams(
        "collection_status=approved&payment_id=123&external_reference=abc-123",
      ),
    );

    render(<CheckoutSuccessPage />, { wrapper: TestWrapper });

    expect(screen.getByText("Referencia")).toBeInTheDocument();
    expect(screen.getByText("abc-123")).toBeInTheDocument();
  });

  it("renders link back to entradas", () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams("collection_status=approved&payment_id=123"),
    );

    render(<CheckoutSuccessPage />, { wrapper: TestWrapper });

    expect(screen.getByText("Volver a entradas")).toBeInTheDocument();
  });

  it("clears cart on mount", () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams("collection_status=approved&payment_id=123"),
    );

    render(<CheckoutSuccessPage />, { wrapper: TestWrapper });

    expect(mockClearCart).toHaveBeenCalledTimes(1);
  });
});
