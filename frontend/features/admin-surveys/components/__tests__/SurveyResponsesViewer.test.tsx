import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestWrapper } from "@/test/test-utils";

vi.mock("@/features/admin-surveys/api/admin-surveys.queries", () => ({
  useOnboardingResponses: vi.fn(),
}));

const mockUseOnboardingResponses = vi.mocked(
  (await import("@/features/admin-surveys/api/admin-surveys.queries"))
    .useOnboardingResponses,
);

async function loadComponent() {
  const { SurveyResponsesViewer } = await import("../SurveyResponsesViewer");
  return SurveyResponsesViewer;
}

function makeData(
  overrides: Partial<{
    data: Array<{
      userId: string;
      name: string | null;
      email: string | null;
      answers: Array<{
        question_id: string;
        answer: string | string[];
      }>;
      created_at: string | null;
    }>;
    total: number;
    page: number;
    limit: number;
  }>,
) {
  return {
    data: [
      {
        userId: "u1",
        name: "Juan Pérez",
        email: "juan@mail.com",
        answers: [
          { question_id: "gender", answer: "Masculino" },
          { question_id: "how_heard", answer: ["Redes sociales"] },
        ],
        created_at: "2026-06-30T12:00:00.000Z",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    ...overrides,
  };
}

describe("SurveyResponsesViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows skeleton while loading", async () => {
    mockUseOnboardingResponses.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const Component = await loadComponent();
    const { container } = render(<Component />, {
      wrapper: TestWrapper,
    });

    const skeletons = container.querySelectorAll(".skeleton-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it("shows error banner on error", async () => {
    mockUseOnboardingResponses.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const Component = await loadComponent();
    render(<Component />, { wrapper: TestWrapper });

    expect(
      screen.getByText(/No se pudieron cargar las encuestas/),
    ).toBeInTheDocument();
  });

  it("shows empty message when no users", async () => {
    mockUseOnboardingResponses.mockReturnValue({
      data: makeData({ data: [], total: 0 }),
      isLoading: false,
      isError: false,
    });

    const Component = await loadComponent();
    render(<Component />, { wrapper: TestWrapper });

    expect(
      screen.getByText("No hay usuarios registrados todavía."),
    ).toBeInTheDocument();
  });

  it("renders accordion items for each user", async () => {
    mockUseOnboardingResponses.mockReturnValue({
      data: makeData({
        data: [
          {
            userId: "u1",
            name: "Juan Pérez",
            email: "juan@mail.com",
            answers: [
              {
                question_id: "gender",
                answer: "Masculino",
              },
            ],
            created_at: "2026-06-30T12:00:00.000Z",
          },
          {
            userId: "u2",
            name: "María Gómez",
            email: "maria@mail.com",
            answers: [],
            created_at: null,
          },
        ],
        total: 2,
      }),
      isLoading: false,
      isError: false,
    });

    const Component = await loadComponent();
    render(<Component />, { wrapper: TestWrapper });

    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("María Gómez")).toBeInTheDocument();
  });

  it("shows Sin encuesta badge for skipped user", async () => {
    mockUseOnboardingResponses.mockReturnValue({
      data: makeData({
        data: [
          {
            userId: "u-skip",
            name: "Skip User",
            email: "skip@mail.com",
            answers: [],
            created_at: null,
          },
        ],
        total: 1,
      }),
      isLoading: false,
      isError: false,
    });

    const Component = await loadComponent();
    render(<Component />, { wrapper: TestWrapper });

    expect(screen.getByText("Sin encuesta")).toBeInTheDocument();
    expect(
      screen.getByText("Este usuario no respondió la encuesta."),
    ).toBeInTheDocument();
  });

  it("shows pagination when multiple pages", async () => {
    mockUseOnboardingResponses.mockReturnValue({
      data: makeData({ total: 40, page: 1 }),
      isLoading: false,
      isError: false,
    });

    const Component = await loadComponent();
    render(<Component />, { wrapper: TestWrapper });

    expect(screen.getByText(/Página 1 de 2/)).toBeInTheDocument();
    expect(screen.getByText("Siguiente")).toBeInTheDocument();
  });

  it("disables Anterior button on first page", async () => {
    mockUseOnboardingResponses.mockReturnValue({
      data: makeData({ total: 40, page: 1 }),
      isLoading: false,
      isError: false,
    });

    const Component = await loadComponent();
    render(<Component />, { wrapper: TestWrapper });

    const anteriorBtn = screen.getByText("Anterior").closest("button");
    expect(anteriorBtn).toBeDisabled();
  });

  it("shows questions grid with labels from config", async () => {
    mockUseOnboardingResponses.mockReturnValue({
      data: makeData({
        data: [
          {
            userId: "u1",
            name: "Juan Pérez",
            email: "juan@mail.com",
            answers: [
              {
                question_id: "gender",
                answer: "Masculino",
              },
              {
                question_id: "how_heard",
                answer: ["Redes sociales"],
              },
            ],
            created_at: "2026-06-30T12:00:00.000Z",
          },
        ],
        total: 1,
      }),
      isLoading: false,
      isError: false,
    });

    const Component = await loadComponent();
    render(<Component />, { wrapper: TestWrapper });

    expect(
      screen.getByText("¿Con qué género te identificas?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("¿Cómo te enteraste del evento?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Masculino")).toBeInTheDocument();
    expect(screen.getByText("Redes sociales")).toBeInTheDocument();
  });
});
