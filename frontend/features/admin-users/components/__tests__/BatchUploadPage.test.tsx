import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TestWrapper } from "@/test/test-utils";
import { BatchUploadPage } from "../BatchUploadPage";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockParseFile = vi.fn();
const mockResetParser = vi.fn();
const mockMutateAsync = vi.fn();
const mockResetMutation = vi.fn();

function mockHooks({
  rows = [],
  errors = [],
  totalRows = 0,
  validCount = 0,
  invalidCount = 0,
  isParsing = false,
  parseError = null,
  isPending = false,
  isError = false,
  isIdle = true,
  data = null,
  error = null,
}: {
  rows?: Record<string, unknown>[];
  errors?: { rowIndex: number; field: string; message: string }[];
  totalRows?: number;
  validCount?: number;
  invalidCount?: number;
  isParsing?: boolean;
  parseError?: string | null;
  isPending?: boolean;
  isError?: boolean;
  isIdle?: boolean;
  data?: Record<string, unknown>[] | null;
  error?: { data?: { emails?: string[]; cedulas?: string[] }; message?: string } | null;
} = {}) {
  vi.mocked(mockMutateAsync).mockResolvedValue(data ?? []);
  return { rows, errors, totalRows, validCount, invalidCount, isParsing, parseError, parseFile: mockParseFile, reset: mockResetParser };
}

vi.mock("../../hooks/useExcelParser", () => ({
  useExcelParser: () => mockHooks(),
}));

vi.mock("../../api/admin-users.queries", () => ({
  useBatchCreateUsers: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    isError: false,
    isIdle: true,
    data: null,
    error: null,
    reset: mockResetMutation,
  }),
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <BatchUploadPage />
    </QueryClientProvider>,
    { wrapper: TestWrapper },
  );
}

describe("BatchUploadPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading and upload zone in idle state", () => {
    renderPage();

    expect(screen.getByText("Carga masiva")).toBeInTheDocument();
    expect(screen.getByText(/arrastra un archivo .xlsx/i)).toBeInTheDocument();
  });

  it("shows spinner during parsing", async () => {
    const hookSpy = vi.spyOn(await import("../../hooks/useExcelParser"), "useExcelParser");
    hookSpy.mockReturnValue({
      rows: [],
      errors: [],
      totalRows: 0,
      validCount: 0,
      invalidCount: 0,
      isParsing: true,
      parseError: null,
      parseFile: mockParseFile,
      reset: mockResetParser,
    });

    const UserCreateDialog = await import("../BatchUploadPage");
    const { useExcelParser: uep } = await import("../../hooks/useExcelParser");

    renderPage();

    expect(screen.getByText("Leyendo archivo...")).toBeInTheDocument();
  });

  it("shows parse error when present", async () => {
    const hookSpy = vi.spyOn(await import("../../hooks/useExcelParser"), "useExcelParser");
    hookSpy.mockReturnValue({
      rows: [],
      errors: [],
      totalRows: 0,
      validCount: 0,
      invalidCount: 0,
      isParsing: false,
      parseError: "Solo archivos .xlsx son permitidos",
      parseFile: mockParseFile,
      reset: mockResetParser,
    });

    renderPage();

    expect(screen.getByText("Solo archivos .xlsx son permitidos")).toBeInTheDocument();
  });

  it("shows preview table and confirm button when data loaded", async () => {
    const hookSpy = vi.spyOn(await import("../../hooks/useExcelParser"), "useExcelParser");
    hookSpy.mockReturnValue({
      rows: [{ fullName: "Juan", email: "juan@test.com", password: "123456", cedula: undefined, phone: undefined }],
      errors: [],
      totalRows: 1,
      validCount: 1,
      invalidCount: 0,
      isParsing: false,
      parseError: null,
      parseFile: mockParseFile,
      reset: mockResetParser,
    });

    renderPage();

    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.getByText("1 de 1 filas válidas")).toBeInTheDocument();
    expect(screen.getByText("Confirmar envío (1 usuario)")).toBeInTheDocument();
  });

  it("calls mutateAsync on confirm click", async () => {
    const hookSpy = vi.spyOn(await import("../../hooks/useExcelParser"), "useExcelParser");
    hookSpy.mockReturnValue({
      rows: [{ fullName: "Juan", email: "juan@test.com", password: "123456", cedula: undefined, phone: undefined }],
      errors: [],
      totalRows: 1,
      validCount: 1,
      invalidCount: 0,
      isParsing: false,
      parseError: null,
      parseFile: mockParseFile,
      reset: mockResetParser,
    });

    const mutationsModule = await import("../../api/admin-users.queries");
    const mockMutate = vi.fn().mockResolvedValue([{ id: "u1", fullName: "Juan", email: "juan@test.com" }]);
    vi.spyOn(mutationsModule, "useBatchCreateUsers").mockReturnValue({
      mutateAsync: mockMutate,
      isPending: false,
      isError: false,
      isIdle: true,
      data: null,
      error: null,
      reset: vi.fn(),
    } as ReturnType<typeof mutationsModule.useBatchCreateUsers>);

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText("Confirmar envío (1 usuario)"));

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith([
      { email: "juan@test.com", password: "123456", fullName: "Juan" },
    ]);
  });

  it("shows success result after mutation", async () => {
    const hookSpy = vi.spyOn(await import("../../hooks/useExcelParser"), "useExcelParser");
    hookSpy.mockReturnValue({
      rows: [{ fullName: "Juan", email: "juan@test.com", password: "123456", cedula: undefined, phone: undefined }],
      errors: [],
      totalRows: 1,
      validCount: 1,
      invalidCount: 0,
      isParsing: false,
      parseError: null,
      parseFile: mockParseFile,
      reset: mockResetParser,
    });

    const mutationsModule = await import("../../api/admin-users.queries");
    vi.spyOn(mutationsModule, "useBatchCreateUsers").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      isIdle: false,
      data: [{ id: "u1", fullName: "Juan", email: "juan@test.com", phone: null, cedula: null, role: null, isActive: true, createdAt: "2026-01-01" }],
      error: null,
      reset: vi.fn(),
    } as ReturnType<typeof mutationsModule.useBatchCreateUsers>);

    renderPage();

    expect(screen.getByText("1 usuario creado exitosamente")).toBeInTheDocument();
  });
});
