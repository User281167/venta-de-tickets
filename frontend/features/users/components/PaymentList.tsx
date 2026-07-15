"use client";

import {
  Box,
  Button,
  HStack,
  Skeleton,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { IconCreditCard } from "@tabler/icons-react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useMyPayments } from "../hooks/usePayments";
import { PaymentRow } from "./PaymentRow";

function EmptyPayments() {
  return (
    <Box textAlign="center" py={20}>
      <Box
        w={20}
        h={20}
        mx="auto"
        borderRadius="full"
        bg="rgba(255,255,255,0.04)"
        border="1px solid rgba(255,255,255,0.08)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={6}
      >
        <IconCreditCard size={36} color="#ff0f7b" />
      </Box>
      <Text color="white" fontSize="xl" fontWeight="bold" mb={2}>
        No hay pagos registrados
      </Text>
      <Text color="brand.muted" maxW="400px" mx="auto">
        Tus compras y transacciones aparecerán aquí cuando realices un pago.
      </Text>
    </Box>
  );
}

export function PaymentList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useMyPayments(page);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (error) {
      toast.error("Error al cargar pagos", {
        description:
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los pagos",
      });
    }
  }, [error]);

  if (isLoading) {
    return (
      <VStack gap={4} align="stretch">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height="140px" borderRadius="2xl" />
        ))}
      </VStack>
    );
  }

  if (!data || data.data.length === 0) {
    return <EmptyPayments />;
  }

  const totalPages = Math.ceil(data.total / data.limit);

  return (
    <Stack gap={8}>
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          gap={4}
        >
          <Stack gap={1}>
            <Text
              color="brand.cyan"
              fontSize="sm"
              fontWeight="black"
              textTransform="uppercase"
              letterSpacing="0.15em"
            >
              Finanzas
            </Text>
            <Text color="white" fontSize="3xl" fontWeight="black">
              Historial de pagos
            </Text>
          </Stack>

          <Box
            px={4}
            py={2}
            borderRadius="xl"
            bg="rgba(255,15,123,0.08)"
            border="1px solid rgba(255,15,123,0.16)"
          >
            <Text color="brand.pink" fontWeight="bold">
              {data.total} {data.total === 1 ? "transacción" : "transacciones"}
            </Text>
          </Box>
        </Stack>
      </motion.div>

      <VStack gap={4} align="stretch">
        {data.data.map((payment) => (
          <PaymentRow key={payment.id} payment={payment} />
        ))}
      </VStack>

      {totalPages > 1 && (
        <HStack justify="center" mt={4} gap={3}>
          <Button
            size="sm"
            variant="outline"
            color="white"
            borderColor="rgba(255,255,255,0.16)"
            borderRadius="xl"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <Text color="brand.muted" fontSize="sm">
            Página {page} de {totalPages}
          </Text>
          <Button
            size="sm"
            variant="outline"
            color="white"
            borderColor="rgba(255,255,255,0.16)"
            borderRadius="xl"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </HStack>
      )}
    </Stack>
  );
}
