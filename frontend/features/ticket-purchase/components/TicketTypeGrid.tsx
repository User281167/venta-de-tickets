"use client";

import { memo } from "react";
import { TicketTypeCard } from "./TicketTypeCard";
import { useCart } from "../hooks/useCart";
import type { TicketType } from "@/features/ticket-types/schemas/ticket-types.schema";

interface TicketTypeGridProps {
  ticketTypes: TicketType[];
  userEgresado: boolean | null;
  isLoggedIn: boolean;
}

export const TicketTypeGrid = memo(function TicketTypeGrid({
  ticketTypes,
  userEgresado,
  isLoggedIn,
}: TicketTypeGridProps) {
  const { items, addItem, increment, decrement, canIncrement, canDecrement } =
    useCart();

  const getQuantity = (ticketTypeId: string) =>
    items.find((i) => i.ticketTypeId === ticketTypeId)?.quantity ?? 0;

  // solo-egresados: oculta solo si user logged + confirmado no-egresado
  // null = loading, mantenemos la card visible (defensa en card: bloquea botón)
  const isBlockedForUser = (tt: TicketType): boolean => {
    if (!tt.onlyEgresados) return false;
    if (!isLoggedIn) return true; // visitante: no puede comprar sin auth
    if (userEgresado === null) return true; // loading: bloquea por seguridad

    return userEgresado === false;
  };

  if (ticketTypes.length === 0) {
    return (
      <p className="!py-10 !text-center !text-white/60">
        No hay tipos de entrada disponibles
      </p>
    );
  }

  return (
    <div className="!grid !grid-cols-1 !gap-5 md:!grid-cols-2">
      {ticketTypes.map((tt) => (
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
          isEgresadoBlocked={isBlockedForUser(tt)}
        />
      ))}
    </div>
  );
});
