"use client";

import { memo } from "react";
import { Box, Flex, Text, Separator } from "@chakra-ui/react";
import type { CartItem } from "../hooks/useCart";

interface OrderSummaryProps {
  items: CartItem[];
  totalAmount: number;
}

export const OrderSummary = memo(function OrderSummary({
  items,
  totalAmount,
}: OrderSummaryProps) {
  if (items.length === 0) {
    return (
      <Box
        bg="brand.panel"
        borderRadius="xl"
        p={5}
        border="1px solid"
        borderColor="rgba(174, 184, 216, 0.12)"
        position="sticky"
        top="100px"
      >
        <Text fontSize="lg" fontWeight="bold" color="brand.light" mb={4}>
          Resumen del pedido
        </Text>
        <Text fontSize="sm" color="brand.muted">
          Selecciona tus entradas para ver el resumen
        </Text>
      </Box>
    );
  }

  return (
    <Box
      bg="brand.panel"
      borderRadius="xl"
      p={5}
      border="1px solid"
      borderColor="rgba(174, 184, 216, 0.12)"
      position="sticky"
      top="100px"
    >
      <Text fontSize="lg" fontWeight="bold" color="brand.light" mb={4}>
        Resumen del pedido
      </Text>

      <Flex direction="column" gap={3}>
        {items.map((item) => (
          <Flex key={item.ticketType.id} justify="space-between" align="center">
            <Box>
              <Text fontSize="sm" color="brand.light">
                {item.ticketType.name}
              </Text>
              <Text fontSize="xs" color="brand.muted">
                Cant: {item.quantity}
              </Text>
            </Box>
            <Text fontSize="sm" fontWeight="semibold" color="brand.light">
              ${(item.ticketType.price * item.quantity).toLocaleString("es-CO")}
            </Text>
          </Flex>
        ))}
      </Flex>

      <Separator borderColor="rgba(174, 184, 216, 0.15)" my={4} />

      <Flex justify="space-between" align="center">
        <Text fontSize="md" fontWeight="bold" color="brand.light">
          Total
        </Text>
        <Text fontSize="lg" fontWeight="bold" color="brand.cyan">
          ${totalAmount.toLocaleString("es-CO")}
        </Text>
      </Flex>
    </Box>
  );
});
