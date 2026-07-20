import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { system } from "@/components/ui/theme";
import { CartProvider } from "@/providers/CartProvider";
import { CheckoutPageClient } from "../CheckoutPageClient";

const mockPush = vi.fn();
const mockMutate = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("../../api/checkout.queries", () => ({
  useCreateCheckoutPreference: () => mockCheckoutState,
}));

const mockUseMe = vi.fn();
let mockCheckoutState: {
  data: undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  mutate: typeof mockMutate;
  reset: () => void;
} = {
  data: undefined,
  isPending: false,
  isError: false,
  error: null,
  mutate: mockMutate,
  reset: vi.fn(),
};
vi.mock("@/features/users/hooks/useProfile", () => ({
  useMe: () => mockUseMe(),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <QueryClientProvider client={queryClient}>
        <CartProvider>{children}</CartProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

describe("CheckoutPageClient", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = {};
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key: string) => store[key] ?? null,
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      (key: string, value: string) => {
        store[key] = value;
      },
    );
    mockCheckoutState = {
      data: undefined,
      isPending: false,
      isError: false,
      error: null,
      mutate: mockMutate,
      reset: vi.fn(),
    };
    mockUseMe.mockReturnValue({
      data: {
        user: {
          id: "u-1",
          email: "test@test.com",
          role: "user",
          fullName: "Test User",
          cedula: "12345678",
          phone: null,
          address: null,
          dateOfBirth: null,
        },
        consentStatus: { required: false, acceptedAt: null, policyVersion: "1" },
      },
      isLoading: false,
    });
  });

  it("renders items list, OrderSummary, and Pagar button when cart has items", async () => {
    store["cart-current-event"] = JSON.stringify([
      {
        ticketTypeId: "tt-1",
        name: "General",
        unitPriceCents: 50000,
        quantity: 2,
        maxPerUser: 4,
        availableStock: 100,
      },
    ]);

    render(<CheckoutPageClient />, { wrapper: Wrapper });

    const items = screen.getAllByText("General");
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Resumen del pedido")).toBeInTheDocument();
    expect(screen.getByTestId("pagar-mp-button")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("redirects to /entradas when cart is empty", async () => {
    render(<CheckoutPageClient />, { wrapper: Wrapper });

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/entradas");
    });
  });

  it("disables Pagar and shows hint when profile is incomplete", () => {
    store["cart-current-event"] = JSON.stringify([
      {
        ticketTypeId: "tt-1",
        name: "General",
        unitPriceCents: 50000,
        quantity: 1,
        maxPerUser: 4,
        availableStock: 100,
      },
    ]);

    mockUseMe.mockReturnValue({
      data: {
        user: {
          id: "u-1",
          email: "test@test.com",
          role: "user",
          fullName: null,
          cedula: null,
          phone: null,
          address: null,
          dateOfBirth: null,
        },
        consentStatus: { required: false, acceptedAt: null, policyVersion: "1" },
      },
      isLoading: false,
    });

    render(<CheckoutPageClient />, { wrapper: Wrapper });

    const btn = screen.getByTestId("pagar-mp-button");
    expect(btn).toBeDisabled();
    expect(screen.getByTestId("profile-incomplete-hint")).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("opens UserIncompleteDialog when backend returns USER_INFO_INCOMPLETE", async () => {
    store["cart-current-event"] = JSON.stringify([
      {
        ticketTypeId: "tt-1",
        name: "General",
        unitPriceCents: 50000,
        quantity: 1,
        maxPerUser: 4,
        availableStock: 100,
      },
    ]);

    const { CheckoutError } = await import("../../api/checkout.api");
    mockCheckoutState = {
      data: undefined,
      isPending: false,
      isError: true,
      error: new CheckoutError("USER_INFO_INCOMPLETE", "User info incomplete", [
        "cedula",
      ]),
      mutate: mockMutate,
      reset: vi.fn(),
    };

    render(<CheckoutPageClient />, { wrapper: Wrapper });

    expect(await screen.findByText("Completa tu perfil")).toBeInTheDocument();
    expect(screen.getByText("Cédula")).toBeInTheDocument();
  });

  it("opens CheckoutErrorDialog on SOLD_OUT error", async () => {
    store["cart-current-event"] = JSON.stringify([
      {
        ticketTypeId: "tt-1",
        name: "General",
        unitPriceCents: 50000,
        quantity: 1,
        maxPerUser: 4,
        availableStock: 100,
      },
    ]);

    const { CheckoutError } = await import("../../api/checkout.api");
    mockCheckoutState = {
      data: undefined,
      isPending: false,
      isError: true,
      error: new CheckoutError("SOLD_OUT", "Sold out"),
      mutate: mockMutate,
      reset: vi.fn(),
    };

    render(<CheckoutPageClient />, { wrapper: Wrapper });

    expect(await screen.findByText("Entradas agotadas")).toBeInTheDocument();
  });
});
