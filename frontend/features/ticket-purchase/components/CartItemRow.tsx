"use client";

import { memo } from "react";
import { Flex, Text, IconButton } from "@chakra-ui/react";
import { IconTrash } from "@tabler/icons-react";
import { CartQuantitySpinner } from "./CartQuantitySpinner";
import type { CartItem } from "../schemas/cart.schema";

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
  return (
    <Flex
      justify="space-between"
      align="center"
      gap={3}
      px={1}
      py={2}
      borderBottom="1px solid"
      borderColor="rgba(174, 184, 216, 0.1)"
    >
      <Flex direction="column" minW="0" flex={1}>
        <Text
          fontSize="sm"
          fontWeight="semibold"
          color="brand.light"
          truncate
        >
          {item.name}
        </Text>
        <Text fontSize="xs" color="brand.muted">
          ${(item.unitPriceCents).toLocaleString("es-CO")} c/u
        </Text>
      </Flex>

      <CartQuantitySpinner
        quantity={item.quantity}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        canIncrement={canIncrement}
        canDecrement={canDecrement}
      />

      <Text
        fontSize="sm"
        fontWeight="bold"
        color="brand.light"
        minW="70px"
        textAlign="right"
      >
        ${(item.unitPriceCents * item.quantity).toLocaleString("es-CO")}
      </Text>

      <IconButton
        aria-label="Eliminar"
        variant="ghost"
        size="xs"
        color="brand.muted"
        _hover={{ color: "red.400", bg: "rgba(255,0,0,0.1)" }}
        onClick={onRemove}
      >
        <IconTrash size={16} />
      </IconButton>
    </Flex>
  );
});
