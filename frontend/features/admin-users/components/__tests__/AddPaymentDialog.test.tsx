import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AddPaymentDialog } from "../AddPaymentDialog";
import * as ticketTypesQueries from "@/features/ticket-types/api/ticket-types.queries";
import * as adminPaymentsQueries from "@/features/admin-payments/api/admin-payments.queries";
import type { AdminTicketType } from "@/features/ticket-types/schemas/ticket-types.schema";
import type { UserRow } from "../../api/admin-users.queries";

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <ChakraProvider value={defaultSystem}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </ChakraProvider>,
  );
}

const mockUser: UserRow = {
  id: "user-1",
  email: "test@example.com",
  fullName: "Test User",
  phone: null,
  cedula: null,
  role: "client",
  isActive: true,
  createdAt: "2024-01-01",
};

const mockTicketType: AdminTicketType = {
  id: "tt-1",
  name: "VIP",
  description: null,
  price: 100000,
  quantityTotal: 10,
  quantitySold: 2,
  maxPerUser: null,
  saleEndsAt: null,
  isActive: true,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

describe("AddPaymentDialog", () => {
  const mutateAsync = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    vi.spyOn(ticketTypesQueries, "useAdminTicketTypes").mockReturnValue({
      data: [mockTicketType],
      isLoading: false,
      error: null,
      isPending: false,
      isError: false,
      isSuccess: true,
      status: "success",
      fetchStatus: "idle",
      isFetching: false,
      isLoadingError: false,
      isRefetchError: false,
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isPlaceholderData: false,
      isStale: false,
      isInitialLoading: false,
      refetch: vi.fn(),
      promise: Promise.resolve([mockTicketType]),
    } as ReturnType<typeof ticketTypesQueries.useAdminTicketTypes>);

    vi.spyOn(adminPaymentsQueries, "useCreateAdminPayment").mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: false,
      isIdle: true,
      isPaused: false,
      isSuccess: false,
      status: "idle",
      variables: undefined,
      submittedAt: 0,
      reset: vi.fn(),
      mutate: vi.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
    } as unknown as ReturnType<typeof adminPaymentsQueries.useCreateAdminPayment>);
  });

  it("renders dialog when user is provided", () => {
    renderWithProviders(<AddPaymentDialog user={mockUser} setUser={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Registrar pago" })).toBeInTheDocument();
    expect(screen.getByText("VIP")).toBeInTheDocument();
  });

  it("does not render dialog content when user is null", () => {
    renderWithProviders(<AddPaymentDialog user={null} setUser={vi.fn()} />);
    expect(screen.queryByText("Registrar pago")).not.toBeInTheDocument();
  });

  it("increments ticket quantity and enables submit", () => {
    renderWithProviders(<AddPaymentDialog user={mockUser} setUser={vi.fn()} />);

    const incrementButton = screen.getByLabelText("Aumentar");
    fireEvent.click(incrementButton);

    expect(screen.getByDisplayValue("1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrar pago" })).not.toBeDisabled();
  });

  it("submits payment with selected tickets", async () => {
    mutateAsync.mockResolvedValueOnce({ paymentId: "pay-1" });
    const setUser = vi.fn();

    renderWithProviders(<AddPaymentDialog user={mockUser} setUser={setUser} />);

    fireEvent.click(screen.getByLabelText("Aumentar"));
    fireEvent.click(screen.getByRole("button", { name: "Registrar pago" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        userId: "user-1",
        provider: "MANUAL",
        tickets: [{ ticketTypeId: "tt-1", quantity: 1 }],
      });
    });

    expect(setUser).toHaveBeenCalledWith(null);
  });

  it("disables increment when sold out", () => {
    vi.spyOn(ticketTypesQueries, "useAdminTicketTypes").mockReturnValue({
      data: [{ ...mockTicketType, quantityTotal: 2, quantitySold: 2 }],
      isLoading: false,
    } as ReturnType<typeof ticketTypesQueries.useAdminTicketTypes>);

    renderWithProviders(<AddPaymentDialog user={mockUser} setUser={vi.fn()} />);

    expect(screen.getByLabelText("Aumentar")).toBeDisabled();
    expect(screen.getByText("0 disponibles")).toBeInTheDocument();
  });
});
