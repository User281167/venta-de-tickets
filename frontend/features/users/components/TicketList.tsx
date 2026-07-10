"use client";

import { Box, Button, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useMyTickets } from "../hooks/useMyTickets";
import { TicketCard } from "./TicketCard";

export function TicketList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useMyTickets(page);

  useEffect(() => {
    if (error) {
      toast.error("Error al cargar entradas", {
        description: error instanceof Error ? error.message : "No se pudieron cargar las entradas",
      });
    }
  }, [error]);

  if (isLoading) {
    return (
      <VStack gap={4} align="stretch">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height="100px" borderRadius="md" />
        ))}
      </VStack>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <Box textAlign="center" py={16}>
        <Text color="gray.400" fontSize="lg">
          No tienes entradas registradas
        </Text>
      </Box>
    );
  }

  const totalPages = Math.ceil(data.total / data.limit);

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" color="white" mb={6}>
        Mis Entradas
      </Text>

      <VStack gap={4} align="stretch">
        {data.data.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </VStack>

      {totalPages > 1 && (
        <HStack justify="center" mt={6} gap={2}>
          <Button
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <Text color="gray.400" fontSize="sm">
            {page} / {totalPages}
          </Text>
          <Button
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </HStack>
      )}
    </Box>
  );
}
