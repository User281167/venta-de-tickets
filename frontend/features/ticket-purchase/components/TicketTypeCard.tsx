"use client";

import { memo } from "react";
import { Box, Flex, Text, Separator } from "@chakra-ui/react";
import { CartQuantitySpinner } from "./CartQuantitySpinner";
import type { TicketType } from "@/features/ticket-types/schemas/ticket-types.schema";

interface TicketTypeCardProps {
  ticketType: TicketType;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  canIncrement: boolean;
  canDecrement: boolean;
}

export const TicketTypeCard = memo(function TicketTypeCard({
  ticketType,
  quantity,
  onIncrement,
  onDecrement,
  canIncrement,
  canDecrement,
}: TicketTypeCardProps) {
  return (
    <Flex
      direction="column"
      bg="brand.panel"
      borderRadius="xl"
      p={5}
      border="1px solid"
      borderColor="rgba(174, 184, 216, 0.12)"
      transition="border-color 0.2s"
      _hover={{ borderColor: "brand.muted" }}
    >
      <Flex justify="space-between" align="flex-start" mb={1}>
        <Text fontSize="lg" fontWeight="bold" color="brand.light">
          {ticketType.name}
        </Text>

        <Box textAlign="right">
          <Text fontSize="xs" color="brand.muted">
            Por persona
          </Text>

          <Text fontSize="xl" fontWeight="bold" color="brand.cyan">
            ${Number(ticketType.price).toLocaleString("es-CO")}
          </Text>
        </Box>
      </Flex>

      {ticketType.description && (
        <Text fontSize="sm" color="brand.muted" mb={3} lineHeight="1.5">
          {ticketType.description}
        </Text>
      )}

      <Separator borderColor="rgba(174, 184, 216, 0.15)" my={3} />

      <Flex justify="space-between" align="center" mt="auto">
        <Text fontSize="sm" color="brand.muted">
          {ticketType.availableCount <= 0
            ? "Agotado"
            : `Solo quedan ${ticketType.availableCount}`}
        </Text>

        <CartQuantitySpinner
          quantity={quantity}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          canIncrement={canIncrement}
          canDecrement={canDecrement}
        />
      </Flex>
    </Flex>
  );
});
