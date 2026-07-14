"use client";

import { useReducer, useMemo, useCallback, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { CartItem } from "../schemas/cart.schema";
import type { TicketType } from "@/features/ticket-types/schemas/ticket-types.schema";

export type CartAction =
  | { type: "ADD"; ticketType: TicketType }
  | { type: "REMOVE"; ticketTypeId: string }
  | { type: "INCREMENT"; ticketTypeId: string }
  | { type: "DECREMENT"; ticketTypeId: string }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[]; eventId: string | null };

export interface CartState {
  items: CartItem[];
  eventId: string | null;
}

const STORAGE_KEY = "cart-current-event";

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const tt = action.ticketType;
      const existing = state.items.find((i) => i.ticketTypeId === tt.id);

      if (existing) {
        const nextQty = existing.quantity + 1;
        const maxAllowed = tt.maxPerUser ?? Infinity;
        if (nextQty > Math.min(maxAllowed, tt.availableCount)) return state;

        return {
          ...state,
          items: state.items.map((i) =>
            i.ticketTypeId === tt.id ? { ...i, quantity: nextQty } : i,
          ),
        };
      }

      if (tt.isSoldOut || tt.availableCount <= 0) return state;

      const newItem: CartItem = {
        ticketTypeId: tt.id,
        name: tt.name,
        unitPriceCents: tt.price,
        quantity: 1,
        maxPerUser: tt.maxPerUser,
        availableStock: tt.availableCount,
      };

      return { ...state, items: [...state.items, newItem] };
    }

    case "REMOVE":
      return {
        ...state,
        items: state.items.filter(
          (i) => i.ticketTypeId !== action.ticketTypeId,
        ),
      };

    case "INCREMENT": {
      const item = state.items.find(
        (i) => i.ticketTypeId === action.ticketTypeId,
      );

      if (!item) return state;

      const nextQty = item.quantity + 1;
      const maxAllowed = item.maxPerUser ?? Infinity;

      if (nextQty > Math.min(maxAllowed, item.availableStock)) return state;

      return {
        ...state,
        items: state.items.map((i) =>
          i.ticketTypeId === action.ticketTypeId
            ? { ...i, quantity: nextQty }
            : i,
        ),
      };
    }

    case "DECREMENT": {
      const item = state.items.find(
        (i) => i.ticketTypeId === action.ticketTypeId,
      );

      if (!item) return state;
      if (item.quantity <= 1) {
        return {
          ...state,
          items: state.items.filter(
            (i) => i.ticketTypeId !== action.ticketTypeId,
          ),
        };
      }

      return {
        ...state,
        items: state.items.map((i) =>
          i.ticketTypeId === action.ticketTypeId
            ? { ...i, quantity: i.quantity - 1 }
            : i,
        ),
      };
    }

    case "CLEAR":
      return { items: [], eventId: null };

    case "HYDRATE":
      return { items: action.items, eventId: action.eventId };

    default:
      return state;
  }
}

function getInitialItems(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useCartReducer() {
  const [savedItems, setSavedItems] = useLocalStorage<CartItem[]>(
    STORAGE_KEY,
    [],
  );

  const [state, dispatch] = useReducer(cartReducer, {
    items: savedItems.length > 0 ? savedItems : getInitialItems(),
    eventId: null,
  });

  const canIncrement = useCallback(
    (ticketTypeId: string): boolean => {
      const item = state.items.find((i) => i.ticketTypeId === ticketTypeId);

      if (!item) return true;

      const maxAllowed = item.maxPerUser ?? Infinity;
      return item.quantity < Math.min(maxAllowed, item.availableStock);
    },
    [state.items],
  );

  const canDecrement = useCallback(
    (ticketTypeId: string): boolean => {
      const item = state.items.find((i) => i.ticketTypeId === ticketTypeId);
      return (item?.quantity ?? 0) > 0;
    },

    [state.items],
  );

  const totalItems = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items],
  );

  const subtotalCents = useMemo(
    () =>
      state.items.reduce(
        (sum, item) => sum + item.unitPriceCents * item.quantity,
        0,
      ),
    [state.items],
  );

  useEffect(() => {
    setSavedItems(state.items);
  }, [state.items, setSavedItems]);

  return {
    items: state.items,
    totalItems,
    subtotalCents,
    dispatch,
    canIncrement,
    canDecrement,
  };
}
