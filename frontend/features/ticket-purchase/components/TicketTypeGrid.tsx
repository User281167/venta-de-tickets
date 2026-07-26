"use client";

import { memo } from "react";
import { TicketTypeCard } from "./TicketTypeCard";
import { useCart } from "../hooks/useCart";
import type { TicketType } from "@/features/ticket-types/schemas/ticket-types.schema";

interface TicketTypeGridProps {
  ticketTypes: TicketType[];
}

export const TicketTypeGrid = memo(function TicketTypeGrid({
  ticketTypes,
}: TicketTypeGridProps) {
  const { items, addItem, increment, decrement, canIncrement, canDecrement } =
    useCart();

  const getQuantity = (ticketTypeId: string) =>
    items.find((i) => i.ticketTypeId === ticketTypeId)?.quantity ?? 0;

  const filteredTicketTypes = ticketTypes.filter(
    (tt) => tt.status === "enabled",
  );

  if (filteredTicketTypes.length === 0) {
    return (
      <p className="!py-10 !text-center !text-white/60">
        No hay tipos de entrada disponibles
      </p>
    );
  }

  return (
    <div className="!grid !grid-cols-1 !gap-5 md:!grid-cols-2">
      {filteredTicketTypes.map((tt) => (
        <TicketTypeCard
          key={tt.id}
          ticketType={tt}
          quantity={getQuantity(tt.id)}
          onIncrement={() => {
            if (getQuantity(tt.id) === 0) {
              addItem(tt);
            } else {
              increment(tt.id);
            }
          }}
          onDecrement={() => decrement(tt.id)}
          canDecrement={canDecrement(tt.id)}
          canIncrement={canIncrement(tt.id)}
        />
      ))}
    </div>
  );
});
