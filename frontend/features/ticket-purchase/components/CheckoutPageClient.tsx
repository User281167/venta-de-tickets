"use client";

import { useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { IconTicket, IconReload, IconAlertCircle } from "@tabler/icons-react";
import { useCart } from "../hooks/useCart";
import { useCreateCheckoutPreference } from "../api/checkout.queries";
import { OrderSummary } from "./OrderSummary";
import { MpWalletButton } from "./MpWalletButton";
import { formatCurrency } from "@/shared/utils/formats";

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

  const totalTickets = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Box w="full" py={{ base: 6, md: 10 }}>
      <Container>
        <VStack align="start" gap={1} mb={{ base: 6, md: 8 }}>
          <Text
            color="brand.cyan"
            fontSize="sm"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.15em"
          >
            Finalizar compra
          </Text>
          <Heading as="h1" size="2xl" color="white" lineHeight="1.1">
            Revisa tu pedido
          </Heading>
          <Text color="brand.muted">
            {totalTickets} entrada{totalTickets !== 1 ? "s" : ""} en tu carrito
          </Text>
        </VStack>

        <Grid
          w="full"
          templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
          gap={{ base: 6, md: 8 }}
          alignItems="start"
        >
          <GridItem w="full">
            <VStack align="stretch" w="full" gap={4}>
              {items.map((item) => (
                <Grid
                  key={item.ticketTypeId}
                  templateColumns={{
                    base: "auto 1fr",
                    sm: "auto 1fr auto auto",
                  }}
                  gap={{ base: 3, sm: 6, md: 8 }}
                  alignItems="center"
                  bg="brand.panel"
                  borderRadius="2xl"
                  p={{ base: 4, md: 5 }}
                  border="1px solid"
                  borderColor="rgba(255,255,255,0.08)"
                >
                  <GridItem>
                    <Box p={2} borderRadius="xl" bg="rgba(0,229,255,0.1)">
                      <IconTicket size={24} color="#00e5ff" />
                    </Box>
                  </GridItem>

                  <GridItem minW={0}>
                    <Text
                      fontSize="md"
                      fontWeight="black"
                      color="white"
                      lineHeight="1.3"
                    >
                      {item.name}
                    </Text>

                    <Text fontSize="sm" color="brand.muted" whiteSpace="nowrap">
                      {formatCurrency(item.unitPriceCents * 100)} c/u
                    </Text>
                  </GridItem>

                  <GridItem
                    colSpan={{ base: 2, sm: 1 }}
                    textAlign={{ base: "left", sm: "center" }}
                    justifySelf={{ base: "start", sm: "center" }}
                  >
                    <Text fontSize="xs" color="brand.muted">
                      Cantidad
                    </Text>
                    <Text fontSize="lg" fontWeight="black" color="white">
                      x{item.quantity}
                    </Text>
                  </GridItem>

                  <GridItem
                    colSpan={{ base: 2, sm: 1 }}
                    textAlign="right"
                    justifySelf={{ base: "start", sm: "end" }}
                  >
                    <Text fontSize="xs" color="brand.muted">
                      Subtotal
                    </Text>
                    <Text fontSize="lg" fontWeight="black" color="brand.cyan">
                      {formatCurrency(
                        item.unitPriceCents * item.quantity * 100,
                      )}
                    </Text>
                  </GridItem>
                </Grid>
              ))}
            </VStack>
          </GridItem>

          <GridItem w="full">
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
                  h="64px"
                  borderRadius="xl"
                  bg="#ffe600"
                  p={2}
                  onClick={handlePagar}
                  disabled={mutation.isPending}
                  data-testid="pagar-mp-button"
                  _hover={{
                    transform: mutation.isPending
                      ? undefined
                      : "translateY(-2px)",
                    boxShadow: mutation.isPending
                      ? undefined
                      : "0 8px 24px rgba(255,230,0,0.25)",
                  }}
                  _active={{
                    transform: mutation.isPending ? undefined : "translateY(0)",
                  }}
                  transition="all 0.2s ease"
                >
                  {mutation.isPending ? (
                    <Flex>
                      <Spinner size="sm" color="#2d3277" />
                      <Text ml={2} color="#2d3277">
                        Creando preferencia de pago...
                      </Text>
                    </Flex>
                  ) : (
                    <Image
                      src="/logo-mercado-libre.png"
                      alt="Mercado Pago"
                      maxH="64px"
                      maxW="64px"
                      h="full"
                      w="auto"
                      objectFit="contain"
                    />
                  )}
                </Button>
              )}

              {mutation.isError && !preferenceId && (
                <Box mt={4} p={4} borderRadius="xl" data-testid="error-section">
                  <HStack gap={2} mb={3}>
                    <IconAlertCircle size={20} color="#ef4444" />
                    <Text color="red.300" fontSize="sm" fontWeight="semibold">
                      {mutation.error?.message ?? "Error al procesar el pago"}
                    </Text>
                  </HStack>

                  <Button
                    w="full"
                    h="48px"
                    borderRadius="xl"
                    variant="outline"
                    color="white"
                    borderColor="rgba(255,255,255,0.16)"
                    onClick={handleRetry}
                    disabled={mutation.isPending}
                    data-testid="retry-button"
                    _hover={{ bg: "rgba(255,255,255,0.06)" }}
                  >
                    Reintentar
                  </Button>
                </Box>
              )}
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}
