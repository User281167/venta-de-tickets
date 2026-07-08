"use client";

import { useState, useCallback, useMemo } from "react";
import type { TicketType } from "@/features/ticket-types/schemas/ticket-types.schema";

export interface CartItem {
  ticketType: TicketType;
  quantity: number;
}

export function useCart(ticketTypes: TicketType[]) {
  const [items, setItems] = useState<Map<string, CartItem>>(new Map());

  const ticketTypeMap = useMemo(
    () => new Map(ticketTypes.map((t) => [t.id, t])),
    [ticketTypes],
  );

  const canIncrement = useCallback(
    (ticketTypeId: string): boolean => {
      const tt = ticketTypeMap.get(ticketTypeId);
      if (!tt || tt.isSoldOut) return false;

      const current = items.get(ticketTypeId)?.quantity ?? 0;
      const maxUser = tt.maxPerUser ?? Infinity;
      const available = tt.availableCount;

      return current < Math.min(maxUser, available);
    },
    [items, ticketTypeMap],
  );

  const canDecrement = useCallback(
    (ticketTypeId: string): boolean => {
      return (items.get(ticketTypeId)?.quantity ?? 0) > 0;
    },
    [items],
  );

  const increment = useCallback(
    (ticketTypeId: string) => {
      setItems((prev) => {
        const tt = ticketTypeMap.get(ticketTypeId);
        if (!tt) return prev;

        const current = prev.get(ticketTypeId)?.quantity ?? 0;
        const maxUser = tt.maxPerUser ?? Infinity;
        const available = tt.availableCount;

        if (current >= Math.min(maxUser, available)) return prev;

        const next = new Map(prev);
        next.set(ticketTypeId, { ticketType: tt, quantity: current + 1 });
        return next;
      });
    },
    [ticketTypeMap],
  );

  const decrement = useCallback(
    (ticketTypeId: string) => {
      setItems((prev) => {
        const current = prev.get(ticketTypeId)?.quantity ?? 0;
        if (current <= 0) return prev;

        const tt = ticketTypeMap.get(ticketTypeId);
        if (!tt) return prev;

        const next = new Map(prev);
        if (current === 1) {
          next.delete(ticketTypeId);
        } else {
          next.set(ticketTypeId, { ticketType: tt, quantity: current - 1 });
        }
        return next;
      });
    },
    [ticketTypeMap],
  );

  const summary = useMemo(() => {
    let totalItems = 0;
    let totalAmount = 0;
    const list: CartItem[] = [];

    for (const item of items.values()) {
      totalItems += item.quantity;
      totalAmount += item.ticketType.price * item.quantity;
      list.push(item);
    }

    return { totalItems, totalAmount, list };
  }, [items]);

  return {
    items,
    increment,
    decrement,
    canIncrement,
    canDecrement,
    summary,
  };
}
