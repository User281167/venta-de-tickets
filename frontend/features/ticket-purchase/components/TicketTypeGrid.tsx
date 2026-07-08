"use client";

import { memo } from "react";
import { Grid, Text } from "@chakra-ui/react";
import { TicketTypeCard } from "./TicketTypeCard";
import type { TicketType } from "@/features/ticket-types/schemas/ticket-types.schema";
import type { CartItem } from "../hooks/useCart";

interface TicketTypeGridProps {
  ticketTypes: TicketType[];
  cartItems: Map<string, CartItem>;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  canIncrement: (id: string) => boolean;
  canDecrement: (id: string) => boolean;
}

export const TicketTypeGrid = memo(function TicketTypeGrid({
  ticketTypes,
  cartItems,
  onIncrement,
  onDecrement,
  canIncrement,
  canDecrement,
}: TicketTypeGridProps) {
  if (ticketTypes.length === 0) {
    return (
      <Text color="brand.muted" textAlign="center" py={10}>
        No hay tipos de entrada disponibles
      </Text>
    );
  }

  return (
    <Grid
      templateColumns={{ base: "1fr", md: "1fr 1fr" }}
      gap={4}
    >
      {ticketTypes.map((tt) => (
        <TicketTypeCard
          key={tt.id}
          ticketType={tt}
          quantity={cartItems.get(tt.id)?.quantity ?? 0}
          onIncrement={() => onIncrement(tt.id)}
          onDecrement={() => onDecrement(tt.id)}
          canIncrement={canIncrement(tt.id)}
          canDecrement={canDecrement(tt.id)}
        />
      ))}
    </Grid>
  );
});
