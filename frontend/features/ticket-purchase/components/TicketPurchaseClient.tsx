"use client";

import { Grid, GridItem, Box, Heading, Text, Spinner, Center } from "@chakra-ui/react";
import { useActiveTicketTypes } from "../api/ticket-purchase.queries";
import { useCart } from "../hooks/useCart";
import { TicketTypeGrid } from "./TicketTypeGrid";
import { OrderSummary } from "./OrderSummary";

export function TicketPurchaseClient() {
  const { data: ticketTypes, isLoading, error } = useActiveTicketTypes();
  const {
    items: cartItems,
    increment,
    decrement,
    canIncrement,
    canDecrement,
    summary,
  } = useCart(ticketTypes ?? []);

  if (isLoading) {
    return (
      <Center py={20}>
        <Spinner color="brand.cyan" size="xl" />
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
      <Box mb={8}>
        <Heading as="h1" fontSize="3xl" color="brand.light" mb={2}>
          La Convención
        </Heading>
      </Box>

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8} alignItems="start">
        <GridItem>
          <TicketTypeGrid
            ticketTypes={ticketTypes}
            cartItems={cartItems}
            onIncrement={increment}
            onDecrement={decrement}
            canIncrement={canIncrement}
            canDecrement={canDecrement}
          />
        </GridItem>

        <GridItem>
          <OrderSummary items={summary.list} totalAmount={summary.totalAmount} />
        </GridItem>
      </Grid>
    </Box>
  );
}
