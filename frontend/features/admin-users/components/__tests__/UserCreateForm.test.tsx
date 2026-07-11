import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

import { UserCreateForm } from "../UserCreateForm";

function renderWithProviders(ui: React.ReactElement) {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
}

describe("UserCreateForm", () => {
  it("renders all required fields", () => {
    renderWithProviders(
      <UserCreateForm onSave={async () => {}} onCancel={() => {}} />,
    );

    expect(screen.getByText("Correo electrónico")).toBeDefined();
    expect(screen.getByText("Contraseña")).toBeDefined();
    expect(screen.getByText("Nombre completo")).toBeDefined();
    expect(screen.getByText("Crear usuario")).toBeDefined();
    expect(screen.getByText("Cancelar")).toBeDefined();
  });

  it("shows validation errors for empty form", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <UserCreateForm onSave={async () => {}} onCancel={() => {}} />,
    );

    await user.click(screen.getByText("Crear usuario"));

    expect(screen.getByText("Correo inválido")).toBeDefined();
    expect(screen.getByText("Mínimo 6 caracteres")).toBeDefined();
    expect(screen.getByText("Nombre es requerido")).toBeDefined();
  });

  it("calls onSave with valid data", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderWithProviders(
      <UserCreateForm onSave={onSave} onCancel={() => {}} />,
    );

    await user.type(screen.getByPlaceholderText("usuario@ejemplo.com"), "test@test.com");
    await user.type(screen.getByPlaceholderText("Mínimo 6 caracteres"), "123456");
    await user.type(screen.getByPlaceholderText("Nombre y apellido"), "Test User");

    await user.click(screen.getByText("Crear usuario"));

    expect(onSave).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "123456",
      fullName: "Test User",
      phone: null,
    });
  });

  it("calls onCancel when cancel button clicked", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <UserCreateForm onSave={async () => {}} onCancel={onCancel} />,
    );

    await user.click(screen.getByText("Cancelar"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
