import { describe, it, expect } from "vitest";
import {
  ticketTypeSchema,
  adminTicketTypeSchema,
  createTicketTypeSchema,
  updateTicketTypeSchema,
} from "../ticket-types.schema";

const validTicketType = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "General",
  description: "Entrada general al evento",
  priceCents: 120000,
  availableCount: 400,
  maxPerUser: 4,
  saleEndsAt: null,
  isSoldOut: false,
  isActive: true,
  onlyEgresados: false,
  zona: null,
  status: "enabled",
};

describe("ticketTypeSchema (public)", () => {
  it("accepts valid ticket type", () => {
    const result = ticketTypeSchema.safeParse(validTicketType);
    expect(result.success).toBe(true);
  });

  it("accepts ticket type without description", () => {
    const result = ticketTypeSchema.safeParse({
      ...validTicketType,
      description: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts sold out ticket type", () => {
    const result = ticketTypeSchema.safeParse({
      ...validTicketType,
      availableCount: 0,
      isSoldOut: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id, ...rest } = validTicketType;
    const result = ticketTypeSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric price", () => {
    const result = ticketTypeSchema.safeParse({
      ...validTicketType,
      priceCents: "free",
    });
    expect(result.success).toBe(false);
  });
});

describe("adminTicketTypeSchema", () => {
  const validAdminTicketType = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "General",
    description: "Entrada general",
    priceCents: 120000,
    quantityTotal: 500,
    quantitySold: 100,
    maxPerUser: 4,
    status: "enabled" as const,
    isActive: true,
    saleEndsAt: null,
    onlyEgresados: false,
    zona: "bronce" as const,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-15T00:00:00.000Z",
  };

  it("accepts valid admin ticket type", () => {
    const result = adminTicketTypeSchema.safeParse(validAdminTicketType);
    expect(result.success).toBe(true);
  });

  it("accepts inactive ticket type", () => {
    const result = adminTicketTypeSchema.safeParse({
      ...validAdminTicketType,
      isActive: false,
      status: "disabled",
    });
    expect(result.success).toBe(true);
  });

  it("accepts blocked ticket type", () => {
    const result = adminTicketTypeSchema.safeParse({
      ...validAdminTicketType,
      isActive: false,
      status: "blocked",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = adminTicketTypeSchema.safeParse({
      ...validAdminTicketType,
      status: "archived",
    });
    expect(result.success).toBe(false);
  });

  it("accepts nullable zona", () => {
    const result = adminTicketTypeSchema.safeParse({
      ...validAdminTicketType,
      zona: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts all valid zona values", () => {
    for (const z of ["vip", "plata", "bronce"] as const) {
      const result = adminTicketTypeSchema.safeParse({
        ...validAdminTicketType,
        zona: z,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid zona", () => {
    const result = adminTicketTypeSchema.safeParse({
      ...validAdminTicketType,
      zona: "oro",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing quantitySold", () => {
    const { quantitySold, ...rest } = validAdminTicketType;
    const result = adminTicketTypeSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing createdAt", () => {
    const { createdAt, ...rest } = validAdminTicketType;
    const result = adminTicketTypeSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe("createTicketTypeSchema (frontend)", () => {
  it("accepts valid create payload", () => {
    const result = createTicketTypeSchema.safeParse({
      name: "VIP",
      priceCents: 250000,
      quantityTotal: 100,
    });
    expect(result.success).toBe(true);
  });

  it("accepts payload with all optional fields", () => {
    const result = createTicketTypeSchema.safeParse({
      name: "VIP",
      priceCents: 250000,
      quantityTotal: 100,
      description: "Experiencia VIP",
      maxPerUser: 2,
      saleEndsAt: "2026-07-30T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createTicketTypeSchema.safeParse({
      name: "",
      priceCents: 250000,
      quantityTotal: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = createTicketTypeSchema.safeParse({
      name: "VIP",
      priceCents: -1,
      quantityTotal: 100,
    });
    expect(result.success).toBe(false);
  });

  it("accepts explicit zona", () => {
    const result = createTicketTypeSchema.safeParse({
      name: "VIP",
      priceCents: 250000,
      quantityTotal: 100,
      zona: "vip",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null zona (sin zona)", () => {
    const result = createTicketTypeSchema.safeParse({
      name: "VIP",
      priceCents: 250000,
      quantityTotal: 100,
      zona: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid zona value", () => {
    const result = createTicketTypeSchema.safeParse({
      name: "VIP",
      priceCents: 250000,
      quantityTotal: 100,
      zona: "oro",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateTicketTypeSchema (frontend)", () => {
  it("accepts partial update", () => {
    const result = updateTicketTypeSchema.safeParse({ name: "VIP Plus" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateTicketTypeSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts null saleEndsAt", () => {
    const result = updateTicketTypeSchema.safeParse({ saleEndsAt: null });
    expect(result.success).toBe(true);
  });

  it("rejects negative price", () => {
    const result = updateTicketTypeSchema.safeParse({ priceCents: -100 });
    expect(result.success).toBe(false);
  });

  it("accepts status update", () => {
    const result = updateTicketTypeSchema.safeParse({ status: "blocked" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = updateTicketTypeSchema.safeParse({ status: "archived" });
    expect(result.success).toBe(false);
  });
});
