"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { CartItem } from "@/features/ticket-purchase/schemas/cart.schema";
import type { TicketType } from "@/features/ticket-types/schemas/ticket-types.schema";

const STORAGE_KEY = "cart-current-event";

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotalCents: number;
  addItem: (ticketType: TicketType) => void;
  removeItem: (ticketTypeId: string) => void;
  increment: (ticketTypeId: string) => void;
  decrement: (ticketTypeId: string) => void;
  clearCart: () => void;
  canIncrement: (ticketTypeId: string) => boolean;
  canDecrement: (ticketTypeId: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* invalid data */
  }
  return [];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadFromStorage());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full */
    }
  }, [items]);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const subtotalCents = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0),
    [items],
  );

  const addItem = useCallback((ticketType: TicketType) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.ticketTypeId === ticketType.id);

      if (existing) {
        return prev.map((i) =>
          i.ticketTypeId === ticketType.id
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [
        ...prev,
        {
          ticketTypeId: ticketType.id,
          name: ticketType.name,
          unitPriceCents: ticketType.price,
          quantity: 1,
          maxPerUser: ticketType.maxPerUser,
          availableStock: ticketType.availableCount,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((ticketTypeId: string) => {
    setItems((prev) => prev.filter((i) => i.ticketTypeId !== ticketTypeId));
  }, []);

  const increment = useCallback((ticketTypeId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.ticketTypeId === ticketTypeId
          ? { ...i, quantity: i.quantity + 1 }
          : i,
      ),
    );
  }, []);

  const decrement = useCallback((ticketTypeId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.ticketTypeId === ticketTypeId);
      if (!item) return prev;
      if (item.quantity <= 1) {
        return prev.filter((i) => i.ticketTypeId !== ticketTypeId);
      }
      return prev.map((i) =>
        i.ticketTypeId === ticketTypeId
          ? { ...i, quantity: i.quantity - 1 }
          : i,
      );
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const canIncrement = useCallback(
    (ticketTypeId: string) => {
      const item = items.find((i) => i.ticketTypeId === ticketTypeId);
      if (!item) return true;
      if (item.maxPerUser && item.quantity >= item.maxPerUser) return false;
      if (item.quantity >= item.availableStock) return false;
      return true;
    },
    [items],
  );

  const canDecrement = useCallback(
    (ticketTypeId: string) => {
      const item = items.find((i) => i.ticketTypeId === ticketTypeId);
      return item ? item.quantity >= 1 : false;
    },
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotalCents,
        addItem,
        removeItem,
        increment,
        decrement,
        clearCart,
        canIncrement,
        canDecrement,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return ctx;
}
