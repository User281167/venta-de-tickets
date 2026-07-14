"use client";

import { memo } from "react";
import { Box, Flex, Text, Separator } from "@chakra-ui/react";
import { useCart } from "../hooks/useCart";

export const OrderSummary = memo(function OrderSummary() {
  const { items, subtotalCents } = useCart();

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
          <Flex key={item.ticketTypeId} justify="space-between" align="center">
            <Box>
              <Text fontSize="sm" color="brand.light">
                {item.name}
              </Text>
              <Text fontSize="xs" color="brand.muted">
                Cant: {item.quantity}
              </Text>
            </Box>
            <Text fontSize="sm" fontWeight="semibold" color="brand.light">
              ${(item.unitPriceCents * item.quantity).toLocaleString("es-CO")}
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
          ${subtotalCents.toLocaleString("es-CO")}
        </Text>
      </Flex>
    </Box>
  );
});
