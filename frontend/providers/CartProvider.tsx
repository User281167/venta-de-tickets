"use client";

import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from "react";
import { useCartReducer } from "@/features/ticket-purchase/hooks/useCartReducer";
import type { CartItem } from "@/features/ticket-purchase/schemas/cart.schema";
import type { TicketType } from "@/features/ticket-types/schemas/ticket-types.schema";

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

export function CartProvider({ children }: { children: ReactNode }) {
  const {
    items,
    totalItems,
    subtotalCents,
    dispatch,
    canIncrement,
    canDecrement,
  } = useCartReducer();

  const addItem = useCallback(
    (ticketType: TicketType) => dispatch({ type: "ADD", ticketType }),
    [dispatch],
  );

  const removeItem = useCallback(
    (ticketTypeId: string) => dispatch({ type: "REMOVE", ticketTypeId }),
    [dispatch],
  );

  const increment = useCallback(
    (ticketTypeId: string) => dispatch({ type: "INCREMENT", ticketTypeId }),
    [dispatch],
  );

  const decrement = useCallback(
    (ticketTypeId: string) => dispatch({ type: "DECREMENT", ticketTypeId }),
    [dispatch],
  );

  const clearCart = useCallback(
    () => dispatch({ type: "CLEAR" }),
    [dispatch],
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
