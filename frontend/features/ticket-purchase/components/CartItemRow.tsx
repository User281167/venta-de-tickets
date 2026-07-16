"use client";

import { memo } from "react";
import { Flex, Text, IconButton, Box } from "@chakra-ui/react";
import { IconTrash } from "@tabler/icons-react";
import { CartQuantitySpinner } from "./CartQuantitySpinner";
import type { CartItem } from "../schemas/cart.schema";
import { formatCurrency } from "@/shared/utils/formats";

interface CartItemRowProps {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  canIncrement: boolean;
  canDecrement: boolean;
}

export const CartItemRow = memo(function CartItemRow({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  canIncrement,
  canDecrement,
}: CartItemRowProps) {
  const lineTotal = item.unitPriceCents * item.quantity;

  return (
    <Flex
      direction="column"
      gap={3}
      py={4}
      borderBottom="1px solid"
      borderColor="rgba(255,255,255,0.06)"
    >
      <Flex justify="space-between" align="flex-start" gap={3}>
        <Box flex={1} minW={0}>
          <Text
            fontSize="md"
            fontWeight="black"
            color="white"
            truncate
            lineHeight="1.3"
          >
            {item.name}
          </Text>

          <Text fontSize="xs" color="brand.muted" mt={0.5}>
            {formatCurrency(item.unitPriceCents * 100)} c/u
          </Text>
        </Box>

        <IconButton
          aria-label="Eliminar entrada"
          variant="ghost"
          size="sm"
          color="brand.muted"
          borderRadius="xl"
          _hover={{ color: "red.400", bg: "rgba(239,68,68,0.1)" }}
          onClick={onRemove}
        >
          <IconTrash size={18} />
        </IconButton>
      </Flex>

      <Flex justify="space-between" align="center" gap={3}>
        <CartQuantitySpinner
          quantity={item.quantity}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          canIncrement={canIncrement}
          canDecrement={canDecrement}
        />

        <Text
          fontSize="md"
          fontWeight="black"
          color="white"
          textAlign="right"
          minW="90px"
        >
          {formatCurrency(lineTotal * 100)}
        </Text>
      </Flex>
    </Flex>
  );
});
