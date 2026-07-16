import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserTable } from "../UserTable";
import { TestWrapper } from "@/test/test-utils";

const mockUseUsers = vi.fn();

vi.mock("../../api/admin-users.queries", async () => {
  const actual = await vi.importActual<typeof import("../../api/admin-users.queries")>(
    "../../api/admin-users.queries",
  );
  return {
    ...actual,
    useUsers: () => mockUseUsers(),
    useCreateUser: () => ({ mutateAsync: vi.fn() }),
    useUpdateUser: () => ({ mutateAsync: vi.fn() }),
  };
});

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

const baseUser = {
  id: "u-1",
  fullName: "Ana Pérez",
  email: "ana@example.com",
  phone: "+57 300 123 4567",
  cedula: "12345678",
  role: "client",
  isActive: true,
  createdAt: "2026-01-15T00:00:00Z",
};

const adminUser = {
  ...baseUser,
  id: "u-2",
  fullName: "Carlos Ruiz",
  email: "carlos@example.com",
  role: "admin",
  isActive: false,
};

function createMockReturnValue(overrides: Record<string, unknown> = {}) {
  return {
    data: { data: [baseUser, adminUser], total: 2, page: 1, limit: 20 },
    isLoading: false,
    isError: false,
    ...overrides,
  };
}

describe("UserTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows title and create button", () => {
    mockUseUsers.mockReturnValue(createMockReturnValue());
    renderWithProviders(<UserTable />);

    expect(screen.getByText("Usuarios")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Crear usuario/i })).toBeInTheDocument();
  });

  it("renders user cards", () => {
    mockUseUsers.mockReturnValue(createMockReturnValue());
    renderWithProviders(<UserTable />);

    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    expect(screen.getByText("Carlos Ruiz")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
  });

  it("shows empty state when no users", () => {
    mockUseUsers.mockReturnValue(
      createMockReturnValue({ data: { data: [], total: 0, page: 1, limit: 20 } }),
    );
    renderWithProviders(<UserTable />);

    expect(screen.getByText("No se encontraron usuarios")).toBeInTheDocument();
  });

  it("opens create dialog", async () => {
    mockUseUsers.mockReturnValue(createMockReturnValue());
    renderWithProviders(<UserTable />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Crear usuario/i }));

    expect(screen.getByRole("heading", { name: "Crear usuario" })).toBeInTheDocument();
  });

  it("opens edit dialog when clicking edit", async () => {
    mockUseUsers.mockReturnValue(createMockReturnValue());
    renderWithProviders(<UserTable />);

    const user = userEvent.setup();
    const editButtons = screen.getAllByRole("button", { name: /Editar/i });
    await user.click(editButtons[0]);

    expect(screen.getByText("Editar usuario")).toBeInTheDocument();
  });

  it("switches to table view when clicking table button", async () => {
    mockUseUsers.mockReturnValue(createMockReturnValue());
    renderWithProviders(<UserTable />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Vista de tabla/i }));

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    expect(screen.getByText("Carlos Ruiz")).toBeInTheDocument();
  });

  it("switches back to cards view when clicking cards button", async () => {
    mockUseUsers.mockReturnValue(createMockReturnValue());
    renderWithProviders(<UserTable />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Vista de tabla/i }));
    expect(screen.getByRole("grid")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Vista de tarjetas/i }));
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
  });
});
