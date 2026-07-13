import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TestWrapper } from "@/test/test-utils";
import { RefundDialog } from "../RefundDialog";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../../api/admin-payments.queries", () => ({
  useProcessRefund: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

function renderDialog(open = true) {
  const onOpenChange = vi.fn();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return {
    onOpenChange,
    ...render(
      <QueryClientProvider client={queryClient}>
        <RefundDialog
          paymentId="p1"
          open={open}
          onOpenChange={onOpenChange}
        />
      </QueryClientProvider>,
      { wrapper: TestWrapper },
    ),
  };
}

describe("RefundDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dialog when open", () => {
    renderDialog();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Procesar reembolso" })).toBeInTheDocument();
  });

  it("shows cancellation warning", () => {
    renderDialog();
    expect(screen.getByText(/todos los tickets/)).toBeInTheDocument();
  });

  it("renders reason field", () => {
    renderDialog();
    expect(screen.getByPlaceholderText(/mín\. 10 caracteres/)).toBeInTheDocument();
  });

  it("shows validation error for empty reason", async () => {
    const user = userEvent.setup();
    renderDialog();
    const processBtn = screen.getByRole("button", { name: "Procesar reembolso" });
    await user.click(processBtn);
    expect(screen.getByText(/10 caracteres/)).toBeInTheDocument();
  });
});
