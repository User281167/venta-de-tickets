import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TicketTypesSection } from "../TicketTypesSection";
import { TestWrapper } from "@/test/test-utils";

const mockUseTicketTable = vi.fn();

vi.mock("../../hook/useTicketTypes", () => ({
  useTicketTable: () => mockUseTicketTable(),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <TestWrapper>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </TestWrapper>,
  );
}

const baseTicketType = {
  id: "tt-1",
  name: "General",
  description: "Entrada general",
  price: 120000,
  quantityTotal: 500,
  quantitySold: 120,
  maxPerUser: 4,
  isActive: true,
  saleEndsAt: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const inactiveTicketType = {
  ...baseTicketType,
  id: "tt-2",
  name: "VIP",
  isActive: false,
  quantitySold: 0,
};

function createMockReturnValue(overrides: Record<string, unknown> = {}) {
  return {
    ticketTypes: undefined,
    isLoading: false,
    createMutation: { mutateAsync: vi.fn() },
    updateMutation: { mutateAsync: vi.fn() },
    deactivateMutation: { mutateAsync: vi.fn() },
    editing: null,
    setEditing: vi.fn(),
    showCreate: false,
    setShowCreate: vi.fn(),
    deletingId: null,
    setDeletingId: vi.fn(),
    ticketTypesList: [baseTicketType, inactiveTicketType],
    ...overrides,
  };
}

describe("TicketTypesSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state", () => {
    mockUseTicketTable.mockReturnValue(createMockReturnValue({ isLoading: true }));
    renderWithProviders(<TicketTypesSection />);

    expect(document.querySelector("[class*='spinner']") || document.querySelector("svg")).toBeTruthy();
  });

  it("renders title and create button", () => {
    mockUseTicketTable.mockReturnValue(createMockReturnValue());
    renderWithProviders(<TicketTypesSection />);

    expect(screen.getByText("Tipos de entrada")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nuevo tipo/i })).toBeInTheDocument();
  });

  it("renders ticket type cards", () => {
    mockUseTicketTable.mockReturnValue(createMockReturnValue());
    renderWithProviders(<TicketTypesSection />);

    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("VIP")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
    expect(screen.getByText("Inactivo")).toBeInTheDocument();
  });

  it("shows empty state when no ticket types", () => {
    mockUseTicketTable.mockReturnValue(
      createMockReturnValue({ ticketTypesList: [] }),
    );
    renderWithProviders(<TicketTypesSection />);

    expect(screen.getByText("No hay tipos de entrada registrados")).toBeInTheDocument();
  });

  it("opens create dialog when clicking Nuevo tipo", async () => {
    const setShowCreate = vi.fn();
    mockUseTicketTable.mockReturnValue(
      createMockReturnValue({ setShowCreate }),
    );
    renderWithProviders(<TicketTypesSection />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Nuevo tipo/i }));

    expect(setShowCreate).toHaveBeenCalledWith(true);
  });

  it("calls setEditing when clicking edit", async () => {
    const setEditing = vi.fn();
    mockUseTicketTable.mockReturnValue(createMockReturnValue({ setEditing }));
    renderWithProviders(<TicketTypesSection />);

    const user = userEvent.setup();
    const editButtons = screen.getAllByRole("button", { name: /Editar/i });
    await user.click(editButtons[0]);

    expect(setEditing).toHaveBeenCalledWith(baseTicketType);
  });

  it("calls setDeletingId when clicking desactivar", async () => {
    const setDeletingId = vi.fn();
    mockUseTicketTable.mockReturnValue(createMockReturnValue({ setDeletingId }));
    renderWithProviders(<TicketTypesSection />);

    const user = userEvent.setup();
    const deleteButtons = screen.getAllByRole("button", { name: /Desactivar/i });
    await user.click(deleteButtons[0]);

    expect(setDeletingId).toHaveBeenCalledWith(baseTicketType.id);
  });
});
