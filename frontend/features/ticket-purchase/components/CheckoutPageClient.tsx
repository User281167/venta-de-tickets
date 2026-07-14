"use client";

import { useEffect } from "react";
import {
  Box,
  Container,
  Flex,
  Text,
  Separator,
  Button,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useCart } from "../hooks/useCart";
import { OrderSummary } from "./OrderSummary";
import { MpWalletButton } from "./MpWalletButton";
import { useCreateCheckoutPreference } from "../api/checkout.queries";

export function CheckoutPageClient() {
  const { items } = useCart();
  const router = useRouter();
  const mutation = useCreateCheckoutPreference();

  useEffect(() => {
    if (items.length === 0) return;

    mutation.mutate(
      items.map((i) => ({
        ticketTypeId: i.ticketTypeId,
        quantity: i.quantity,
      })),
    );
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/entradas");
    }
  }, [items, router]);

  if (items.length === 0) return null;

  const errorMsg =
    mutation.error instanceof Error
      ? mutation.error.message
      : mutation.error
        ? "Error al crear la preferencia de pago"
        : null;

  return (
    <Box minH="80vh" py={10}>
      <Container maxW="8xl">
        <Flex gap={8} align="flex-start" wrap={{ base: "wrap", lg: "nowrap" }}>
          {/* Left: items list */}
          <Box flex={2} minW="300px">
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
                  <Text fontSize="md" fontWeight="bold" color="brand.light">
                    $
                    {(item.unitPriceCents * item.quantity).toLocaleString(
                      "es-CO",
                    )}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Box>

          {/* Right: summary + MP Wallet button */}
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

            <Separator borderColor="rgba(174, 184, 216, 0.15)" my={4} />

            {errorMsg ? (
              <Box textAlign="center">
                <Text fontSize="sm" color="red.400" mb={3}>
                  {errorMsg}
                </Text>
                <Button
                  w="full"
                  onClick={() => mutation.reset()}
                  bg="brand.cyan"
                  color="brand.dark"
                  fontWeight="bold"
                  _hover={{ opacity: 0.9 }}
                >
                  Reintentar
                </Button>
              </Box>
            ) : (
              <MpWalletButton
                preferenceId={mutation.data?.preferenceId ?? null}
              />
            )}
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
