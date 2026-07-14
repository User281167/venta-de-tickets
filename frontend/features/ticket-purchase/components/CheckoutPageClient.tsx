"use client";

import { useEffect } from "react";
import { Box, Container, Flex, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useCart } from "../hooks/useCart";
import { OrderSummary } from "./OrderSummary";

export function CheckoutPageClient() {
  const { items } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (items.length === 0) {
      router.push("/entradas");
    }
  }, [items, router]);

  if (items.length === 0) return null;

  return (
    <Box minH="80vh" py={10}>
      <Container maxW="8xl">
        <Flex gap={8} align="flex-start" wrap={{ base: "wrap", lg: "nowrap" }}>
          <Box flex={2} minW="300px" w="full">
            <Text fontSize="2xl" fontWeight="bold" color="brand.light" mb={6}>
              Revisa tu pedido
            </Text>

            <Flex direction="column" gap={0}>
              {items.map((item) => (
                <Flex
                  key={item.ticketTypeId}
                  justify="space-between"
                  align="center"
                  py={3}
                  borderBottom="1px solid"
                  borderColor="rgba(174, 184, 216, 0.1)"
                >
                  <Box>
                    <Text
                      fontSize="md"
                      fontWeight="semibold"
                      color="brand.light"
                    >
                      {item.name}
                    </Text>

                    <Text fontSize="sm" color="brand.muted">
                      Cantidad: {item.quantity}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </Flex>
          </Box>

          <Box
            flex={1}
            minW="320px"
            position="sticky"
            top="100px"
            bg="brand.panel"
            borderRadius="xl"
            p={5}
            border="1px solid"
            borderColor="rgba(174, 184, 216, 0.12)"
          >
            <OrderSummary hideComprar />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
