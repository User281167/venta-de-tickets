"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";

import { Box, Flex, Text, Separator, Button } from "@chakra-ui/react";
import { useCart } from "../hooks/useCart";
import { useAuth } from "@/providers/AuthProvider";

interface OrderSummaryProps {
  hideComprar?: boolean;
}

export const OrderSummary = memo(function OrderSummary({
  hideComprar,
}: OrderSummaryProps) {
  const { items, subtotalCents } = useCart();

  const { user } = useAuth();
  const router = useRouter();

  const handleBuy = () => {
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    router.push("/checkout");
  };

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

      <Flex justify="space-between" align="center" mt={1}>
        <Text fontSize="xs" color="brand.muted">
          {items.reduce((sum, i) => sum + i.quantity, 0)} entrada(s)
        </Text>

        <Text fontSize="xs" color="brand.muted">
          IVA incluido
        </Text>
      </Flex>

      {!hideComprar && (
        <Button
          w="full"
          disabled={items.length === 0}
          onClick={handleBuy}
          border="1px solid transparent"
          bg={`
            linear-gradient(#020414, #020414) padding-box,
            linear-gradient(90deg, #ff0f7b, #00e5ff) border-box
          `}
          color="white"
          fontWeight="bold"
          fontSize="md"
          _hover={{
            transform: items.length > 0 ? "translateY(-1px)" : undefined,
            boxShadow:
              items.length > 0 ? "0 0 20px rgba(0,229,255,0.3)" : undefined,
          }}
          _active={{
            transform: items.length > 0 ? "translateY(0)" : undefined,
          }}
          transition="all 0.2s"
          opacity={items.length === 0 ? 0.4 : 1}
          cursor={items.length === 0 ? "not-allowed" : "pointer"}
        >
          COMPRAR
        </Button>
      )}
    </Box>
  );
});
