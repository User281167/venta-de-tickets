"use client";

import { memo } from "react";
import { HStack, Button, Text } from "@chakra-ui/react";
import { IconMinus, IconPlus } from "@tabler/icons-react";

interface CartQuantitySpinnerProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  canIncrement: boolean;
  canDecrement: boolean;
}

export const CartQuantitySpinner = memo(function CartQuantitySpinner({
  quantity,
  onIncrement,
  onDecrement,
  canIncrement,
  canDecrement,
}: CartQuantitySpinnerProps) {
  return (
    <HStack gap={0}>
      <Button
        size="sm"
        variant="outline"
        disabled={!canDecrement}
        onClick={onDecrement}
        borderColor="brand.muted"
        borderRight="none"
        borderStartRadius="md"
        borderEndRadius="0"
        px={2}
        minW="36px"
        h="36px"
        color="brand.light"
        _disabled={{ opacity: 0.3, cursor: "not-allowed" }}
        _hover={{ color: "black" }}
      >
        <IconMinus size={16} />
      </Button>

      <Text
        w="44px"
        textAlign="center"
        fontSize="md"
        fontWeight="semibold"
        color="brand.light"
        borderY="1px"
        borderColor="brand.muted"
        lineHeight="36px"
        h="36px"
      >
        {quantity}
      </Text>

      <Button
        size="sm"
        variant="outline"
        disabled={!canIncrement}
        onClick={onIncrement}
        borderColor="brand.muted"
        borderLeft="none"
        borderStartRadius="0"
        borderEndRadius="md"
        px={2}
        minW="36px"
        h="36px"
        color="brand.light"
        _disabled={{ opacity: 0.3, cursor: "not-allowed" }}
        _hover={{ color: "black" }}
      >
        <IconPlus size={16} />
      </Button>
    </HStack>
  );
});
