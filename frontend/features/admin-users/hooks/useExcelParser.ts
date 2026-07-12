import { useState, useCallback } from "react";
import { readSheet } from "read-excel-file/browser";
import {
  excelRowSchema,
  type ParsedExcelRow,
} from "../schemas/admin-user.schema";

const MAX_ROWS = 50;

type RowError = {
  rowIndex: number;
  field: string;
  message: string;
};

type ParsedState = {
  rows: ParsedExcelRow[];
  errors: RowError[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
  isParsing: boolean;
  parseError: string | null;
};

const INITIAL_STATE: ParsedState = {
  rows: [],
  errors: [],
  totalRows: 0,
  validCount: 0,
  invalidCount: 0,
  isParsing: false,
  parseError: null,
};

const excelSchema = {
  fullName: { column: "nombre completo", type: String, required: true },
  cedula: { column: "cédula", type: String, required: false },
  phone: { column: "teléfono", type: String, required: false },
  email: { column: "correo electrónico", type: String, required: true },
  password: { column: "contraseña", type: String, required: true },
};

export function useExcelParser() {
  const [state, setState] = useState<ParsedState>(INITIAL_STATE);

  const parseFile = useCallback(async (file: File | null) => {
    if (!file) {
      setState(INITIAL_STATE);
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx") {
      setState({
        ...INITIAL_STATE,
        parseError: "Solo archivos .xlsx son permitidos",
      });
      return;
    }

    setState((prev) => ({ ...prev, isParsing: true, parseError: null }));

    try {
      const result = await readSheet(file, { schema: excelSchema });
      const sheetObjects =
        (result as { objects?: Record<string, unknown>[] }).objects ?? [];
      const sheetErrors =
        (
          result as {
            errors?: { row?: number; column?: string; error?: string }[];
          }
        ).errors ?? [];

      if (sheetErrors.length > 0) {
        const parseErrors = sheetErrors.map((e) => ({
          rowIndex: e.row ?? 0,
          field: e.column ?? "unknown",
          message: e.error ?? "Error de formato",
        }));
        setState({
          ...INITIAL_STATE,
          errors: parseErrors,
          parseError: "El archivo tiene errores de formato.",
        });
        return;
      }

      if (sheetObjects.length > MAX_ROWS) {
        setState({
          ...INITIAL_STATE,
          parseError: `Máximo ${MAX_ROWS} filas permitidas. El archivo tiene ${sheetObjects.length} filas.`,
        });
        return;
      }

      const rows: ParsedExcelRow[] = [];
      const errors: RowError[] = [];

      for (let i = 0; i < sheetObjects.length; i++) {
        const obj = sheetObjects[i];

        const rowData: Record<string, string | undefined> = {
          fullName: (obj.fullName as string) || undefined,
          cedula: (obj.cedula as string) || undefined,
          phone: (obj.phone as string) || undefined,
          email: (obj.email as string) || undefined,
          password: (obj.password as string) || undefined,
        };

        const zodResult = excelRowSchema.safeParse(rowData);
        if (zodResult.success) {
          rows.push(zodResult.data);
        } else {
          rows.push({
            fullName: rowData.fullName ?? "",
            cedula: rowData.cedula,
            phone: rowData.phone,
            email: rowData.email ?? "",
            password: rowData.password ?? "",
          });

          for (const issue of zodResult.error.issues) {
            errors.push({
              rowIndex: i,
              field: issue.path.join("."),
              message: issue.message,
            });
          }
        }
      }

      setState({
        rows,
        errors,
        totalRows: sheetObjects.length,
        validCount:
          sheetObjects.length - new Set(errors.map((e) => e.rowIndex)).size,
        invalidCount: new Set(errors.map((e) => e.rowIndex)).size,
        isParsing: false,
        parseError: null,
      });
    } catch {
      setState({
        ...INITIAL_STATE,
        parseError:
          "Error al leer el archivo. Asegúrate de que sea un .xlsx válido.",
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { ...state, parseFile, reset };
}
