"use client";

import { Box, Button, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useMyPayments } from "../hooks/usePayments";
import { PaymentRow } from "./PaymentRow";

export function PaymentList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useMyPayments(page);

  useEffect(() => {
    if (error) {
      toast.error("Error al cargar pagos", {
        description: error instanceof Error ? error.message : "No se pudieron cargar los pagos",
      });
    }
  }, [error]);

  if (isLoading) {
    return (
      <VStack gap={4} align="stretch">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height="60px" borderRadius="md" />
        ))}
      </VStack>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <Box textAlign="center" py={16}>
        <Text color="gray.400" fontSize="lg">
          No hay pagos registrados
        </Text>
      </Box>
    );
  }

  const totalPages = Math.ceil(data.total / data.limit);

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" color="white" mb={6}>
        Historial de pagos
      </Text>

      <VStack gap={3} align="stretch">
        {data.data.map((payment) => (
          <PaymentRow key={payment.id} payment={payment} />
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
