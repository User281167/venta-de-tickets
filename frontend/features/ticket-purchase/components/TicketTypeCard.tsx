"use client";

import { memo } from "react";
import { Box, Flex, Text, Separator, Button } from "@chakra-ui/react";
import { IconPlus } from "@tabler/icons-react";
import { CartQuantitySpinner } from "./CartQuantitySpinner";
import type { TicketType } from "@/features/ticket-types/schemas/ticket-types.schema";
import { formatCurrency } from "@/shared/utils/formats";

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
  const isSoldOut = ticketType.availableCount <= 0;

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
            {formatCurrency(Number(ticketType.price) * 100)}
          </Text>
        </Box>
      </Flex>

      {ticketType.description && (
        <Text fontSize="sm" color="brand.muted" mb={3} lineHeight="1.5">
          {ticketType.description}
        </Text>
      )}

      <Separator borderColor="rgba(174, 184, 216, 0.15)" my={3} />

      <Flex justify="space-between" align="center" mt="auto" gap="4">
        <Text fontSize="sm" color="brand.muted">
          {isSoldOut
            ? "Agotado"
            : `Solo quedan ${ticketType.availableCount}`}
        </Text>

        {isSoldOut ? (
          <Text fontSize="sm" color="brand.muted" fontWeight="semibold">
            Agotado
          </Text>
        ) : quantity === 0 ? (
          <Button
            size="sm"
            variant="outline"
            disabled={!canIncrement}
            onClick={onIncrement}
            borderColor="brand.cyan"
            color="brand.cyan"
            _hover={{ bg: "rgba(0, 229, 255, 0.1)" }}
            _disabled={{ opacity: 0.3, cursor: "not-allowed" }}
          >
            <IconPlus size={16} />
            Agregar
          </Button>
        ) : (
          <CartQuantitySpinner
            quantity={quantity}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            canIncrement={canIncrement}
            canDecrement={canDecrement}
          />
        )}
      </Flex>
    </Flex>
  );
});
