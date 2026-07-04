import { describe, it, expect } from "vitest";
import {
  ticketTypeSchema,
  eventWithTicketTypesSchema,
  adminTicketTypeSchema,
  createTicketTypeSchema,
  updateTicketTypeSchema,
} from "../ticket-types.schema";

const validTicketType = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "General",
  description: "Entrada general al evento",
  price: 120000,
  availableCount: 400,
  maxPerUser: 4,
  saleEndsAt: null,
  isSoldOut: false,
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
      price: "free",
    });
    expect(result.success).toBe(false);
  });
});

describe("eventWithTicketTypesSchema", () => {
  it("accepts valid event with ticket types", () => {
    const result = eventWithTicketTypesSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "La Convención 2026",
      description: "El evento del año",
      eventDate: "2026-07-15T20:00:00.000Z",
      doorsOpenAt: "2026-07-15T18:00:00.000Z",
      saleEndsAt: null,
      location: "Centro de Eventos, Medellín",
      status: "published",
      ticketTypes: [validTicketType],
    });
    expect(result.success).toBe(true);
  });

  it("accepts event with empty ticket types", () => {
    const result = eventWithTicketTypesSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "La Convención 2026",
      description: null,
      eventDate: "2026-07-15T20:00:00.000Z",
      doorsOpenAt: null,
      saleEndsAt: null,
      location: null,
      status: "published",
      ticketTypes: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = eventWithTicketTypesSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      eventDate: "2026-07-15T20:00:00.000Z",
      status: "published",
      ticketTypes: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("adminTicketTypeSchema", () => {
  const validAdminTicketType = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "General",
    description: "Entrada general",
    price: 120000,
    quantityTotal: 500,
    quantitySold: 100,
    maxPerUser: 4,
    isActive: true,
    saleEndsAt: null,
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
    });
    expect(result.success).toBe(true);
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
      price: 250000,
      quantityTotal: 100,
    });
    expect(result.success).toBe(true);
  });

  it("accepts payload with all optional fields", () => {
    const result = createTicketTypeSchema.safeParse({
      name: "VIP",
      price: 250000,
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
      price: 250000,
      quantityTotal: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = createTicketTypeSchema.safeParse({
      name: "VIP",
      price: -1,
      quantityTotal: 100,
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
    const result = updateTicketTypeSchema.safeParse({ price: -100 });
    expect(result.success).toBe(false);
  });
});
