"use client";

import { useEffect, useState } from "react";
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
import { IconTicket, IconAlertCircle } from "@tabler/icons-react";
import { useCart } from "../hooks/useCart";
import { useCreateCheckoutPreference } from "../api/checkout.queries";
import { CheckoutError } from "../api/checkout.api";
import { useMe } from "@/features/users/hooks/useProfile";
import { OrderSummary } from "./OrderSummary";
import { MpWalletButton } from "./MpWalletButton";
import { UserIncompleteDialog } from "./UserIncompleteDialog";
import {
  CheckoutErrorDialog,
  type CheckoutErrorCode,
} from "./CheckoutErrorDialog";
import { formatCurrency } from "@/shared/utils/formats";

const PROFILE_FIELDS = ["cedula", "fullName"] as const;

function pickMissingFields(user: {
  cedula: string | null;
  fullName: string | null;
}): string[] {
  return PROFILE_FIELDS.filter((f) => !user[f]);
}

function isCheckoutError(err: unknown): err is CheckoutError {
  return err instanceof CheckoutError;
}

export function CheckoutPageClient() {
  const { items } = useCart();
  const router = useRouter();
  const mutation = useCreateCheckoutPreference();
  const { data: meData, isLoading: isLoadingMe } = useMe();

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const preferenceId = mutation.data?.preferenceId ?? null;

  useEffect(() => {
    if (items.length === 0) {
      router.push("/entradas");
    }
  }, [items, router]);

  const missingFields = meData?.user
    ? pickMissingFields({
        cedula: meData.user.cedula,
        fullName: meData.user.fullName,
      })
    : [];
  const isProfileIncomplete = missingFields.length > 0;

  if (items.length === 0) return null;

  const totalTickets = items.reduce((sum, i) => sum + i.quantity, 0);
  const err = mutation.error;
  const isError = mutation.isError;
  const errorCode: CheckoutErrorCode | "USER_INFO_INCOMPLETE" | null = err
    ? (err as { code?: string }).code === "USER_INFO_INCOMPLETE"
      ? "USER_INFO_INCOMPLETE"
      : (((err as { code?: string }).code as CheckoutErrorCode) ?? "INTERNAL_ERROR")
    : null;
  const dialogMissingFields = isCheckoutError(err) ? err.missingFields : missingFields;
  const dialogMessage = isCheckoutError(err) ? err.message : undefined;

  const handlePagar = () => {
    if (isProfileIncomplete) {
      setProfileDialogOpen(true);
      return;
    }
    mutation.mutate(items);
  };

  const handleDialogRetry = () => {
    mutation.reset();
    if (items.length > 0 && !isProfileIncomplete) {
      mutation.mutate(items);
    }
  };

  const handleProfileDialogChange = (open: boolean) => {
    setProfileDialogOpen(open);
    if (!open && isError && errorCode === "USER_INFO_INCOMPLETE") {
      mutation.reset();
    }
  };

  const handleErrorDialogChange = (open: boolean) => {
    setErrorDialogOpen(open);
    if (!open && isError && errorCode !== "USER_INFO_INCOMPLETE") {
      mutation.reset();
    }
  };

  const pagarDisabled =
    mutation.isPending || isProfileIncomplete || isLoadingMe;

  const profileDialogForceOpen = isError && errorCode === "USER_INFO_INCOMPLETE";
  const errorDialogForceOpen =
    isError && errorCode !== null && errorCode !== "USER_INFO_INCOMPLETE";

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
                <VStack align="stretch" gap={2} mt={4}>
                  <Button
                    w="full"
                    h="64px"
                    borderRadius="xl"
                    bg="#ffe600"
                    p={2}
                    onClick={handlePagar}
                    disabled={pagarDisabled}
                    title={
                      isProfileIncomplete
                        ? "Completa tu perfil para pagar"
                        : undefined
                    }
                    data-testid="pagar-mp-button"
                    _hover={{
                      transform: pagarDisabled
                        ? undefined
                        : "translateY(-2px)",
                      boxShadow: pagarDisabled
                        ? undefined
                        : "0 8px 24px rgba(255,230,0,0.25)",
                    }}
                    _active={{
                      transform: pagarDisabled ? undefined : "translateY(0)",
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

                  {isProfileIncomplete && !mutation.isPending && (
                    <HStack
                      gap={2}
                      p={2}
                      borderRadius="lg"
                      bg="rgba(245,158,11,0.08)"
                      border="1px solid rgba(245,158,11,0.2)"
                    >
                      <IconAlertCircle size={16} color="#f59e0b" />
                      <Text
                        fontSize="xs"
                        color="amber.200"
                        lineHeight="1.4"
                        data-testid="profile-incomplete-hint"
                      >
                        Completa tu cédula y nombre para pagar
                      </Text>
                    </HStack>
                  )}
                </VStack>
              )}
            </Box>
          </GridItem>
        </Grid>
      </Container>

      <UserIncompleteDialog
        open={profileDialogOpen || profileDialogForceOpen}
        onOpenChange={handleProfileDialogChange}
        missingFields={
          isError && errorCode === "USER_INFO_INCOMPLETE"
            ? dialogMissingFields
            : missingFields
        }
      />

      <CheckoutErrorDialog
        open={errorDialogOpen || errorDialogForceOpen}
        onOpenChange={handleErrorDialogChange}
        code={errorCode as CheckoutErrorCode | null}
        message={dialogMessage}
        onRetry={handleDialogRetry}
      />
    </Box>
  );
}
