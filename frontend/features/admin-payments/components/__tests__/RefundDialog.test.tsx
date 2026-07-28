import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TestWrapper } from "@/test/test-utils";
import { RefundDialog } from "../RefundDialog";
import { ApiError } from "@/shared/api/api-error";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockMutateAsync = vi.fn();
let mockIsPending = false;

vi.mock("../../api/admin-payments.queries", () => ({
  useProcessRefund: () => ({
    mutateAsync: (...args: unknown[]) => mockMutateAsync(...args),
    isPending: mockIsPending,
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
    mockIsPending = false;
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

  it("shows specific message when error code is USED_TICKET", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValueOnce(
      new ApiError(409, "USED_TICKET", "USED_TICKET"),
    );
    renderDialog();
    const reason = screen.getByPlaceholderText(/mín\. 10 caracteres/);
    await user.type(reason, "Cliente solicitó reembolso");
    const processBtn = screen.getByRole("button", { name: "Procesar reembolso" });
    await user.click(processBtn);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Error, uno de los ticketes ya ha sido usado.",
      );
    });
  });

  it("shows generic message on other errors", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValueOnce(new Error("boom"));
    renderDialog();
    const reason = screen.getByPlaceholderText(/mín\. 10 caracteres/);
    await user.type(reason, "Cliente solicitó reembolso");
    const processBtn = screen.getByRole("button", { name: "Procesar reembolso" });
    await user.click(processBtn);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Error al procesar el reembolso",
      );
    });
  });
});
