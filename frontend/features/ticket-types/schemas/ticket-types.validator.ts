import { ZodError } from "zod";

export interface FieldErrors {
  name?: string;
  price?: string;
  quantityTotal?: string;
}

export function formatZodErrors(error: ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0] as keyof FieldErrors;

    if (field && !fieldErrors[field]) {
      if (field === "name") fieldErrors.name = "El nombre es obligatorio";
      else if (field === "price")
        fieldErrors.price = "El precio debe ser mayor a 0";
      else if (field === "quantityTotal")
        fieldErrors.quantityTotal = "La cantidad debe ser mayor a 0";
    }
  }

  return fieldErrors;
}
