"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, Text, Separator, Button, VStack, Badge, HStack } from "@chakra-ui/react";
import { useCart } from "../hooks/useCart";
import { useAuth } from "@/providers/AuthProvider";
import { formatCurrency } from "@/shared/utils/formats";
import { IconShoppingCart, IconTicket, IconArrowRight } from "@tabler/icons-react";

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

  const totalTickets = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Box
      bg="brand.panel"
      borderRadius="2xl"
      p={{ base: 5, md: 6 }}
      border="1px solid"
      borderColor="rgba(255,255,255,0.08)"
      position="sticky"
      top={{ base: 4, md: 8 }}
      boxShadow="0 20px 40px rgba(0,0,0,0.25)"
    >
      <HStack gap={3} mb={5}>
        <Box p={2} borderRadius="xl" bg="rgba(124,60,255,0.12)">
          <IconShoppingCart size={22} color="#7c3cff" />
        </Box>
        <Text fontSize="xl" fontWeight="black" color="white">
          Resumen del pedido
        </Text>
      </HStack>

      {items.length === 0 ? (
        <VStack align="center" gap={4} py={8} textAlign="center">
          <Box p={3} borderRadius="full" bg="rgba(255,255,255,0.04)">
            <IconTicket size={32} color="brand.muted" />
          </Box>
          <VStack gap={1}>
            <Text fontSize="md" fontWeight="semibold" color="white">
              Tu carrito está vacío
            </Text>
            <Text fontSize="sm" color="brand.muted">
              Selecciona tus entradas para ver el resumen
            </Text>
          </VStack>
        </VStack>
      ) : (
        <VStack align="stretch" gap={0}>
          <VStack align="stretch" gap={3} mb={4}>
            {items.map((item) => (
              <Flex
                key={item.ticketTypeId}
                justify="space-between"
                align="center"
                gap={3}
              >
                <HStack gap={3} flex={1} minW={0}>
                  <Badge
                    px={2}
                    py={0.5}
                    borderRadius="md"
                    bg="rgba(0,229,255,0.1)"
                    color="brand.cyan"
                    fontSize="xs"
                    fontWeight="black"
                    minW="32px"
                    textAlign="center"
                  >
                    x{item.quantity}
                  </Badge>

                  <Box minW={0}>
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color="white"
                      truncate
                    >
                      {item.name}
                    </Text>
                    <Text fontSize="xs" color="brand.muted">
                      {formatCurrency(item.unitPriceCents * 100)} c/u
                    </Text>
                  </Box>
                </HStack>

                <Text
                  fontSize="sm"
                  fontWeight="black"
                  color="white"
                  textAlign="right"
                  minW="80px"
                >
                  {formatCurrency(item.unitPriceCents * item.quantity * 100)}
                </Text>
              </Flex>
            ))}
          </VStack>

          <Separator borderColor="rgba(255,255,255,0.08)" mb={4} />

          <Flex justify="space-between" align="center" mb={1}>
            <Text fontSize="sm" color="brand.muted">
              {totalTickets} entrada{totalTickets !== 1 ? "s" : ""}
            </Text>
            <Text fontSize="xs" color="brand.muted">
              IVA incluido
            </Text>
          </Flex>

          <Flex justify="space-between" align="center" mb={5}>
            <Text fontSize="lg" fontWeight="black" color="white">
              Total
            </Text>
            <Text
              fontSize="2xl"
              fontWeight="black"
              color="brand.cyan"
              lineHeight="1"
            >
              {formatCurrency(subtotalCents * 100)}
            </Text>
          </Flex>
        </VStack>
      )}

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
          fontWeight="black"
          fontSize="md"
          borderRadius="xl"
          h="48px"
          _hover={
            items.length > 0
              ? {
                  transform: "translateY(-2px)",
                  boxShadow: "0 0 24px rgba(0,229,255,0.35)",
                }
              : undefined
          }
          _active={
            items.length > 0
              ? {
                  transform: "translateY(0)",
                }
              : undefined
          }
          _disabled={{
            opacity: 0.4,
            cursor: "not-allowed",
          }}
          transition="all 0.2s ease"
          opacity={items.length === 0 ? 0.5 : 1}
        >
          <HStack gap={2}>
            <Text>COMPRAR</Text>
            {items.length > 0 && <IconArrowRight size={18} />}
          </HStack>
        </Button>
      )}
    </Box>
  );
});
