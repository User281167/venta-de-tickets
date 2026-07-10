"use client";

import { Box, Flex, HStack, Separator, Text } from "@chakra-ui/react";
import type { TicketItem } from "../types/ticket.types";
import { formatCOP } from "./formatCOP";

const STATUS_BG: Record<string, string> = {
  reserved: "yellow.500",
  paid: "green.500",
  pending_confirmation: "yellow.500",
  confirmed: "blue.500",
  used: "gray.500",
  cancelled: "red.500",
  expired: "red.500",
};

const STATUS_LABELS: Record<string, string> = {
  reserved: "Reservada",
  paid: "Pagada",
  pending_confirmation: "Pendiente de confirmación",
  confirmed: "Confirmada",
  used: "Usada",
  cancelled: "Cancelada",
  expired: "Expirada",
};

export function TicketCard({ ticket }: { ticket: TicketItem }) {
  return (
    <Box bg="brand.panel" borderRadius="md" p={4}>
      <Flex justify="space-between" align="start" wrap="wrap" gap={2}>
        <Box>
          <Text color="white" fontWeight="semibold">
            {ticket.ticketType.name}
          </Text>
          <Text fontSize="sm" fontFamily="monospace" color="gray.400" mt={1}>
            {ticket.ticketCode}
          </Text>
        </Box>

        <HStack gap={3}>
          <Text color="white" fontSize="sm">
            {formatCOP(ticket.ticketType.price)}
          </Text>
          <Box
            px={2}
            py={0.5}
            borderRadius="full"
            bg={STATUS_BG[ticket.status] ?? "gray.500"}
          >
            <Text fontSize="xs" color="white" fontWeight="medium">
              {STATUS_LABELS[ticket.status] ?? ticket.status}
            </Text>
          </Box>
        </HStack>
      </Flex>

      <Separator my={3} borderColor="gray.600" />

      <Text fontSize="xs" color="gray.500">
        {ticket.purchasedAt
          ? `Comprada el ${new Date(ticket.purchasedAt).toLocaleDateString("es-CO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}`
          : `Creada el ${new Date(ticket.createdAt).toLocaleDateString("es-CO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}`}
      </Text>
    </Box>
  );
}
