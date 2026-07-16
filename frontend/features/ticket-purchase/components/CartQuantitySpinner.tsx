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
    <HStack gap={0} borderRadius="xl" overflow="hidden">
      <Button
        size="sm"
        variant="outline"
        disabled={!canDecrement}
        onClick={onDecrement}
        borderColor="rgba(255,255,255,0.16)"
        borderRight="none"
        borderStartRadius="xl"
        borderEndRadius="0"
        px={2}
        minW="40px"
        h="40px"
        color="white"
        bg="rgba(255,255,255,0.03)"
        _disabled={{ opacity: 0.35, cursor: "not-allowed" }}
        _hover={canDecrement ? { bg: "rgba(255,255,255,0.08)" } : undefined}
        transition="all 0.2s ease"
      >
        <IconMinus size={16} />
      </Button>

      <Text
        w="48px"
        textAlign="center"
        fontSize="md"
        fontWeight="black"
        color="white"
        borderY="1px"
        borderColor="rgba(255,255,255,0.16)"
        lineHeight="40px"
        h="40px"
        bg="rgba(255,255,255,0.03)"
      >
        {quantity}
      </Text>

      <Button
        size="sm"
        variant="outline"
        disabled={!canIncrement}
        onClick={onIncrement}
        borderColor="rgba(255,255,255,0.16)"
        borderLeft="none"
        borderStartRadius="0"
        borderEndRadius="xl"
        px={2}
        minW="40px"
        h="40px"
        color="white"
        bg="rgba(255,255,255,0.03)"
        _disabled={{ opacity: 0.35, cursor: "not-allowed" }}
        _hover={canIncrement ? { bg: "rgba(255,255,255,0.08)" } : undefined}
        transition="all 0.2s ease"
      >
        <IconPlus size={16} />
      </Button>
    </HStack>
  );
});
