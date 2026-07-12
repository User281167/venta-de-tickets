import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestWrapper } from "@/test/test-utils";
import { UploadPreviewTable } from "../UploadPreviewTable";
import type { ParsedExcelRow } from "../../schemas/admin-user.schema";

const validRows: ParsedExcelRow[] = [
  { fullName: "Juan Pérez", email: "juan@test.com", password: "123456", cedula: "12345678", phone: "3001112233" },
  { fullName: "María García", email: "maria@test.com", password: "abcdef", cedula: "87654321", phone: "3004445566" },
];

const mixedRows: ParsedExcelRow[] = [
  { fullName: "Juan Pérez", email: "juan@test.com", password: "123456", cedula: "12345678", phone: "3001112233" },
  { fullName: "", email: "bad", password: "12", cedula: undefined, phone: undefined },
];

const rowErrors = [
  { rowIndex: 1, field: "email", message: "Correo inválido" },
  { rowIndex: 1, field: "password", message: "Mínimo 6 caracteres" },
  { rowIndex: 1, field: "fullName", message: "Nombre es requerido" },
];

describe("UploadPreviewTable", () => {
  it("renders nothing when no rows", () => {
    const { container } = render(
      <UploadPreviewTable rows={[]} errors={[]} totalRows={0} validCount={0} invalidCount={0} />,
      { wrapper: TestWrapper },
    );

    expect(container.innerHTML).toBe("");
  });

  it("renders all valid rows", () => {
    render(
      <UploadPreviewTable rows={validRows} errors={[]} totalRows={2} validCount={2} invalidCount={0} />,
      { wrapper: TestWrapper },
    );

    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("María García")).toBeInTheDocument();
    expect(screen.getByText("2 de 2 filas válidas")).toBeInTheDocument();
  });

  it("shows Válida for valid rows", () => {
    render(
      <UploadPreviewTable rows={validRows} errors={[]} totalRows={2} validCount={2} invalidCount={0} />,
      { wrapper: TestWrapper },
    );

    const validLabels = screen.getAllByText("Válida");
    expect(validLabels).toHaveLength(2);
  });

  it("shows validation errors for invalid rows", () => {
    render(
      <UploadPreviewTable rows={mixedRows} errors={rowErrors} totalRows={2} validCount={1} invalidCount={1} />,
      { wrapper: TestWrapper },
    );

    expect(screen.getByText("Inválida")).toBeInTheDocument();
    expect(screen.getByText("email: Correo inválido")).toBeInTheDocument();
    expect(screen.getByText("password: Mínimo 6 caracteres")).toBeInTheDocument();
    expect(screen.getByText("fullName: Nombre es requerido")).toBeInTheDocument();
    expect(screen.getByText("1 fila con errores")).toBeInTheDocument();
  });

  it("masks password column", () => {
    render(
      <UploadPreviewTable rows={validRows} errors={[]} totalRows={2} validCount={2} invalidCount={0} />,
      { wrapper: TestWrapper },
    );

    const maskedPasswords = screen.getAllByText("••••••");
    expect(maskedPasswords).toHaveLength(2);
  });

  it("shows dash for empty optional fields", () => {
    const rowsWithoutOptional: ParsedExcelRow[] = [
      { fullName: "Test", email: "test@test.com", password: "123456", cedula: undefined, phone: undefined },
    ];

    render(
      <UploadPreviewTable rows={rowsWithoutOptional} errors={[]} totalRows={1} validCount={1} invalidCount={0} />,
      { wrapper: TestWrapper },
    );

    const dashes = screen.getAllByText("-");
    expect(dashes).toHaveLength(2);
  });
});
