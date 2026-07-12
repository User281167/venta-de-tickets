import { describe, it, expect } from "vitest";
import { excelRowSchema, adminUserCreateSchema } from "../admin-user.schema";

describe("excelRowSchema", () => {
  it("accepts valid row with all fields", () => {
    const result = excelRowSchema.safeParse({
      fullName: "Juan Pérez",
      email: "juan@test.com",
      password: "123456",
      cedula: "12345678",
      phone: "3001234567",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid row with only required fields", () => {
    const result = excelRowSchema.safeParse({
      fullName: "Juan Pérez",
      email: "juan@test.com",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing email", () => {
    const result = excelRowSchema.safeParse({
      fullName: "Juan Pérez",
      password: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = excelRowSchema.safeParse({
      fullName: "Juan Pérez",
      email: "not-an-email",
      password: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = excelRowSchema.safeParse({
      fullName: "Juan Pérez",
      email: "juan@test.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty fullName", () => {
    const result = excelRowSchema.safeParse({
      fullName: "",
      email: "juan@test.com",
      password: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("rejects cedula with non-digits", () => {
    const result = excelRowSchema.safeParse({
      fullName: "Juan Pérez",
      email: "juan@test.com",
      password: "123456",
      cedula: "1234567a",
    });
    expect(result.success).toBe(false);
  });

  it("rejects cedula shorter than 8 digits", () => {
    const result = excelRowSchema.safeParse({
      fullName: "Juan Pérez",
      email: "juan@test.com",
      password: "123456",
      cedula: "1234567",
    });
    expect(result.success).toBe(false);
  });
});

describe("adminUserCreateSchema", () => {
  it("accepts valid user data", () => {
    const result = adminUserCreateSchema.safeParse({
      email: "test@test.com",
      password: "123456",
      fullName: "Test User",
    });
    expect(result.success).toBe(true);
  });

  it("accepts user data with optional fields", () => {
    const result = adminUserCreateSchema.safeParse({
      email: "test@test.com",
      password: "123456",
      fullName: "Test User",
      cedula: "12345678",
      phone: "3001234567",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown fields (strict)", () => {
    const result = adminUserCreateSchema.safeParse({
      email: "test@test.com",
      password: "123456",
      fullName: "Test User",
      extraField: "should fail",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = adminUserCreateSchema.safeParse({
      email: "bad-email",
      password: "123456",
      fullName: "Test User",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = adminUserCreateSchema.safeParse({
      email: "test@test.com",
      password: "12345",
      fullName: "Test User",
    });
    expect(result.success).toBe(false);
  });
});
