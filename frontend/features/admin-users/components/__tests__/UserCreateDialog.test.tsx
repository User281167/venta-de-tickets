import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { UserCreateDialog } from "../UserCreateDialog";

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

describe("UserCreateDialog", () => {
  it("renders when open", () => {
    renderWithProviders(
      <UserCreateDialog open={true} setOpen={() => {}} />,
    );

    expect(screen.getAllByText("Crear usuario").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Correo electrónico")).toBeDefined();
    expect(screen.getByText("Cancelar")).toBeDefined();
  });

  it("body is not visible when closed", () => {
    const { container } = renderWithProviders(
      <UserCreateDialog open={false} setOpen={() => {}} />,
    );

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeNull();
  });
});
