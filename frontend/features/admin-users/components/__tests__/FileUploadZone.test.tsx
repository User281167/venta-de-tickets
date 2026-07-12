import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestWrapper } from "@/test/test-utils";
import { FileUploadZone } from "../FileUploadZone";

describe("FileUploadZone", () => {
  it("renders upload prompt", () => {
    render(
      <FileUploadZone onFileSelect={() => {}} onDownloadTemplate={() => {}} />,
      { wrapper: TestWrapper },
    );

    expect(
      screen.getByText(/arrastra un archivo .xlsx/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/máximo 50 filas/i)).toBeInTheDocument();
  });

  it("renders download template button", () => {
    render(
      <FileUploadZone onFileSelect={() => {}} onDownloadTemplate={() => {}} />,
      { wrapper: TestWrapper },
    );

    expect(screen.getByText("Descargar plantilla")).toBeInTheDocument();
  });

  it("calls onDownloadTemplate when button clicked", async () => {
    const onDownloadTemplate = vi.fn();
    const user = userEvent.setup();

    render(
      <FileUploadZone onFileSelect={() => {}} onDownloadTemplate={onDownloadTemplate} />,
      { wrapper: TestWrapper },
    );

    await user.click(screen.getByText("Descargar plantilla"));
    expect(onDownloadTemplate).toHaveBeenCalledTimes(1);
  });

  it("shows filename and remove button after file selection", async () => {
    const user = userEvent.setup();
    const file = new File(["test"], "usuarios.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    render(
      <FileUploadZone onFileSelect={() => {}} onDownloadTemplate={() => {}} />,
      { wrapper: TestWrapper },
    );

    const input = screen.getByTestId("file-input");
    await user.upload(input, file);

    expect(screen.getByText("usuarios.xlsx")).toBeInTheDocument();
    expect(screen.getByText("Quitar archivo")).toBeInTheDocument();
  });

  it("shows error for non-.xlsx file", () => {
    const onFileSelect = vi.fn();
    const file = new File(["test"], "datos.csv", { type: "text/csv" });

    render(
      <FileUploadZone onFileSelect={onFileSelect} onDownloadTemplate={() => {}} />,
      { wrapper: TestWrapper },
    );

    const input = screen.getByTestId("file-input") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/son permitidos/i)).toBeInTheDocument();
    expect(onFileSelect).toHaveBeenCalledWith(null);
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <FileUploadZone onFileSelect={() => {}} onDownloadTemplate={() => {}} disabled />,
      { wrapper: TestWrapper },
    );

    const downloadBtn = screen.getByText("Descargar plantilla").closest("button");
    expect(downloadBtn).toBeDisabled();
  });
});
