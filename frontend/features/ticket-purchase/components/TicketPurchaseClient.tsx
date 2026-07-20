"use client";

import { Box, Heading, Spinner, Center, Text, VStack, Grid, GridItem } from "@chakra-ui/react";
import { useActiveTicketTypes } from "../api/ticket-purchase.queries";
import { TicketTypeGrid } from "./TicketTypeGrid";
import { OrderSummary } from "./OrderSummary";

export function TicketPurchaseClient() {
  const { data: ticketTypes, isLoading, error } = useActiveTicketTypes();

  if (isLoading) {
    return (
      <Center py={20}>
        <VStack gap={4}>
          <Spinner color="brand.cyan" size="xl" />
          <Text color="brand.muted" fontSize="sm">
            Cargando entradas disponibles...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center py={20}>
        <Text color="brand.muted">
          {error instanceof Error
            ? error.message
            : "Error al cargar las entradas"}
        </Text>
      </Center>
    );
  }

  if (!ticketTypes || ticketTypes.length === 0) {
    return (
      <Center py={20}>
        <Text color="brand.muted">No hay entradas disponibles</Text>
      </Center>
    );
  }

  return (
    <Box>
      <VStack align="start" gap={1} mb={{ base: 6, md: 8 }}>
        <Text
          color="brand.cyan"
          fontSize="sm"
          fontWeight="black"
          textTransform="uppercase"
          letterSpacing="0.15em"
        >
          Compra tus entradas
        </Text>
        <Heading as="h1" size="2xl" color="white" lineHeight="1.1">
          La Convención
        </Heading>
        <Text color="brand.muted" maxW="600px">
          Selecciona el tipo de entrada que deseas adquirir. Las unidades son
          limitadas.
        </Text>
      </VStack>

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={{ base: 6, md: 8 }} alignItems="start">
        <GridItem>
          <TicketTypeGrid ticketTypes={ticketTypes} />
        </GridItem>

        <GridItem>
          <OrderSummary />
        </GridItem>
      </Grid>
    </Box>
  );
}
