import { describe, it, expect } from "vitest";
import { ApiError } from "@/shared/api/api-error";
import { formatApiError, extractApiError } from "@/shared/lib/format-api-error";

describe("formatApiError", () => {
  it("returns friendly cedula duplicate message for CONFLICT with cedula text", () => {
    const err = new ApiError(
      409,
      "La cédula ya está registrada por otro usuario",
      "CONFLICT",
    );
    const f = formatApiError(err);
    expect(f.title).toBe("Cédula duplicada");
    expect(f.description).toBe(
      "Esta cédula ya está registrada por otro usuario.",
    );
  });

  it("returns generic conflict for CONFLICT without cedula text", () => {
    const err = new ApiError(409, "Unique constraint violated", "CONFLICT");
    const f = formatApiError(err);
    expect(f.title).toBe("Conflicto");
    expect(f.description).toBe("Unique constraint violated");
  });

  it("returns friendly CEDULA_INVALIDATION message", () => {
    const err = new ApiError(
      422,
      "Cedula already set and cannot be modified",
      "CEDULA_INVALIDATION",
    );
    const f = formatApiError(err);
    expect(f.title).toBe("Cédula no modificable");
  });

  it("returns friendly VALIDATION_ERROR message", () => {
    const err = new ApiError(422, "campo requerido", "VALIDATION_ERROR");
    const f = formatApiError(err);
    expect(f.title).toBe("Datos inválidos");
    expect(f.description).toBe("campo requerido");
  });

  it("returns friendly UNAUTHORIZED message", () => {
    const err = new ApiError(401, "jwt expired", "UNAUTHORIZED");
    const f = formatApiError(err);
    expect(f.title).toBe("Sin autorización");
  });

  it("falls back to generic title for unknown codes", () => {
    const err = new ApiError(500, "something broke", "WEIRD_CODE");
    const f = formatApiError(err);
    expect(f.title).toBe("Error");
    expect(f.description).toBe("something broke");
  });

  it("handles plain Error", () => {
    const err = new Error("boom");
    const f = formatApiError(err);
    expect(f.description).toBe("boom");
  });

  it("handles string", () => {
    const f = formatApiError("oops");
    expect(f.description).toBe("oops");
  });

  it("handles non-Error values", () => {
    const f = formatApiError(null);
    expect(f.description).toBe("Error inesperado");
  });

  it("extractApiError normalizes ApiError shape", () => {
    const out = extractApiError(new ApiError(409, "msg", "CONFLICT"));
    expect(out.code).toBe("CONFLICT");
    expect(out.message).toBe("msg");
  });
});
