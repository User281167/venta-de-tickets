"use client";

import { useEffect } from "react";
import { Button, Box, Container, Flex, Spinner, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useCart } from "../hooks/useCart";
import { useCreateCheckoutPreference } from "../api/checkout.queries";
import { OrderSummary } from "./OrderSummary";
import { MpWalletButton } from "./MpWalletButton";

export function CheckoutPageClient() {
  const { items } = useCart();
  const router = useRouter();
  const mutation = useCreateCheckoutPreference();

  const preferenceId = mutation.data?.preferenceId ?? null;

  useEffect(() => {
    if (items.length === 0) {
      router.push("/entradas");
    }
  }, [items, router]);

  const handlePagar = () => {
    mutation.mutate(items);
  };

  const handleRetry = () => {
    mutation.reset();
  };

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

            {preferenceId && (
              <Box mt={4} data-testid="wallet-section">
                <MpWalletButton preferenceId={preferenceId} />
              </Box>
            )}

            {!preferenceId && !mutation.isError && (
              <Button
                w="full"
                mt={4}
                colorScheme="blue"
                onClick={handlePagar}
                disabled={mutation.isPending}
                data-testid="pagar-mp-button"
              >
                {mutation.isPending ? (
                  <>
                    <Spinner size="sm" mr={2} /> Procesando...
                  </>
                ) : (
                  "Pagar con Mercado Pago"
                )}
              </Button>
            )}

            {mutation.isError && !preferenceId && (
              <Box mt={4} data-testid="error-section">
                <Text color="red.300" fontSize="sm" mb={2}>
                  {mutation.error?.message ?? "Error al procesar el pago"}
                </Text>
                <Button
                  w="full"
                  colorScheme="red"
                  onClick={handleRetry}
                  disabled={mutation.isPending}
                  data-testid="retry-button"
                >
                  {mutation.isPending ? (
                    <>
                      <Spinner size="sm" mr={2} /> Procesando...
                    </>
                  ) : (
                    "Reintentar"
                  )}
                </Button>
              </Box>
            )}
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
