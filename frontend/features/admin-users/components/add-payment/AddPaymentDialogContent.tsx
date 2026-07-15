"use client";

import {
  Box,
  Grid,
  HStack,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { TicketQuantityCard } from "./TicketQuantityCard";
import { ProviderSelect } from "./ProviderSelect";
import { PaymentTotalSummary } from "./PaymentTotalSummary";
import type { AdminTicketType } from "@/features/ticket-types/schemas/ticket-types.schema";

interface AddPaymentDialogContentProps {
  ticketTypes: AdminTicketType[];
  quantities: Record<string, number>;
  provider: string;
  total: number;
  isLoading: boolean;
  onQuantityChange: (ticketTypeId: string, value: number) => void;
  onProviderChange: (value: string) => void;
}

function EmptyTicketTypes() {
  return (
    <Box textAlign="center" py={10}>
      <Text color="white" fontSize="lg" fontWeight="bold" mb={2}>
        No hay tipos de entrada activos
      </Text>
      <Text color="brand.muted">
        Activa al menos un tipo de entrada para registrar un pago.
      </Text>
    </Box>
  );
}

function LoadingState() {
  return (
    <HStack justify="center" py={10}>
      <Spinner color="brand.cyan" size="xl" />
    </HStack>
  );
}

export function AddPaymentDialogContent({
  ticketTypes,
  quantities,
  provider,
  total,
  isLoading,
  onQuantityChange,
  onProviderChange,
}: AddPaymentDialogContentProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (ticketTypes.length === 0) {
    return <EmptyTicketTypes />;
  }

  return (
    <Stack gap={6}>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
        {ticketTypes.map((tt) => (
          <TicketQuantityCard
            key={tt.id}
            ticketType={tt}
            quantity={quantities[tt.id] ?? 0}
            onChange={(value) => onQuantityChange(tt.id, value)}
          />
        ))}
      </Grid>

      <ProviderSelect value={provider} onChange={onProviderChange} />
      <PaymentTotalSummary total={total} />
    </Stack>
  );
}
