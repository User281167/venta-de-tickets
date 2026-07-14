import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { cartReducer, useCartReducer } from "../useCartReducer";
import type { CartState, CartAction } from "../useCartReducer";
import type { TicketType } from "@/features/ticket-types/schemas/ticket-types.schema";
import type { CartItem } from "../../schemas/cart.schema";

const baseTicket: TicketType = {
  id: "tt-1",
  name: "General",
  description: "Entrada general",
  price: 50000,
  availableCount: 100,
  maxPerUser: 4,
  saleEndsAt: null,
  isSoldOut: false,
  isActive: true,
};

const noLimitTicket: TicketType = {
  ...baseTicket,
  id: "tt-2",
  name: "VIP",
  maxPerUser: null,
};

const soldOutTicket: TicketType = {
  ...baseTicket,
  id: "tt-3",
  name: "Agotado",
  availableCount: 0,
  isSoldOut: true,
};

function item(overrides: Partial<CartItem> = {}): CartItem {
  return {
    ticketTypeId: "tt-1",
    name: "General",
    unitPriceCents: 50000,
    quantity: 1,
    maxPerUser: 4,
    availableStock: 100,
    ...overrides,
  };
}

const empty: CartState = { items: [], eventId: null };

// --- Pure reducer tests ---

describe("cartReducer", () => {
  describe("ADD", () => {
    it("adds new item with quantity 1", () => {
      const next = cartReducer(empty, { type: "ADD", ticketType: baseTicket });
      expect(next.items).toHaveLength(1);
      expect(next.items[0].ticketTypeId).toBe("tt-1");
      expect(next.items[0].quantity).toBe(1);
    });

    it("increments quantity when item already in cart", () => {
      const state: CartState = { items: [item()], eventId: null };
      const next = cartReducer(state, { type: "ADD", ticketType: baseTicket });
      expect(next.items).toHaveLength(1);
      expect(next.items[0].quantity).toBe(2);
    });

    it("prevents exceeding maxPerUser", () => {
      const state: CartState = {
        items: [item({ quantity: 4, maxPerUser: 4 })],
        eventId: null,
      };
      const next = cartReducer(state, { type: "ADD", ticketType: baseTicket });
      expect(next.items[0].quantity).toBe(4);
    });

    it("prevents exceeding availableStock when stock < maxPerUser", () => {
      const lowStock = { ...baseTicket, availableCount: 2 };
      const state: CartState = {
        items: [item({ quantity: 2, availableStock: 2 })],
        eventId: null,
      };
      const next = cartReducer(state, { type: "ADD", ticketType: lowStock });
      expect(next.items[0].quantity).toBe(2);
    });

    it("does not add sold out items", () => {
      const next = cartReducer(empty, {
        type: "ADD",
        ticketType: soldOutTicket,
      });
      expect(next.items).toHaveLength(0);
    });
  });

  describe("REMOVE", () => {
    it("removes item by id", () => {
      const state: CartState = {
        items: [item({ ticketTypeId: "tt-1" }), item({ ticketTypeId: "tt-2" })],
        eventId: null,
      };
      const next = cartReducer(state, { type: "REMOVE", ticketTypeId: "tt-1" });
      expect(next.items).toHaveLength(1);
      expect(next.items[0].ticketTypeId).toBe("tt-2");
    });
  });

  describe("INCREMENT", () => {
    it("increments quantity by 1", () => {
      const state: CartState = { items: [item({ quantity: 1 })], eventId: null };
      const next = cartReducer(state, {
        type: "INCREMENT",
        ticketTypeId: "tt-1",
      });
      expect(next.items[0].quantity).toBe(2);
    });

    it("respects maxPerUser boundary", () => {
      const state: CartState = {
        items: [item({ quantity: 4, maxPerUser: 4 })],
        eventId: null,
      };
      const next = cartReducer(state, {
        type: "INCREMENT",
        ticketTypeId: "tt-1",
      });
      expect(next.items[0].quantity).toBe(4);
    });

    it("respects no limit (maxPerUser = null)", () => {
      const state: CartState = {
        items: [item({ quantity: 10, maxPerUser: null, availableStock: 20 })],
        eventId: null,
      };
      const next = cartReducer(state, {
        type: "INCREMENT",
        ticketTypeId: "tt-1",
      });
      expect(next.items[0].quantity).toBe(11);
    });
  });

  describe("DECREMENT", () => {
    it("decrements quantity by 1", () => {
      const state: CartState = {
        items: [item({ quantity: 3 })],
        eventId: null,
      };
      const next = cartReducer(state, {
        type: "DECREMENT",
        ticketTypeId: "tt-1",
      });
      expect(next.items[0].quantity).toBe(2);
    });

    it("removes item when quantity reaches 1", () => {
      const state: CartState = { items: [item({ quantity: 1 })], eventId: null };
      const next = cartReducer(state, {
        type: "DECREMENT",
        ticketTypeId: "tt-1",
      });
      expect(next.items).toHaveLength(0);
    });
  });

  describe("CLEAR", () => {
    it("clears all items and eventId", () => {
      const state: CartState = {
        items: [item(), item({ ticketTypeId: "tt-2" })],
        eventId: "evt-1",
      };
      const next = cartReducer(state, { type: "CLEAR" });
      expect(next.items).toHaveLength(0);
      expect(next.eventId).toBeNull();
    });
  });

  describe("HYDRATE", () => {
    it("restores items and eventId", () => {
      const items = [item({ quantity: 3 })];
      const next = cartReducer(empty, {
        type: "HYDRATE",
        items,
        eventId: "evt-1",
      });
      expect(next.items).toEqual(items);
      expect(next.eventId).toBe("evt-1");
    });
  });
});

// --- Hook integration tests ---

describe("useCartReducer", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty state initially", () => {
    const { result } = renderHook(() => useCartReducer());
    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.subtotalCents).toBe(0);
  });

  it("canIncrement returns true for non-existing item", () => {
    const { result } = renderHook(() => useCartReducer());
    expect(result.current.canIncrement("unknown")).toBe(true);
  });

  it("canDecrement returns false for non-existing item", () => {
    const { result } = renderHook(() => useCartReducer());
    expect(result.current.canDecrement("unknown")).toBe(false);
  });
});
