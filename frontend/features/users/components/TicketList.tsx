"use client";

import {
  Box,
  Button,
  Grid,
  HStack,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import { IconTicket } from "@tabler/icons-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useMyTickets } from "../hooks/useMyTickets";
import { TicketCard } from "./TicketCard";

function EmptyTickets() {
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
        <IconTicket size={36} color="#00e5ff" />
      </Box>
      <Text color="white" fontSize="xl" fontWeight="bold" mb={2}>
        No tienes entradas registradas
      </Text>
      <Text color="brand.muted" maxW="400px" mx="auto">
        Cuando compres o reserves una entrada aparecerá aquí con su QR de acceso.
      </Text>
    </Box>
  );
}

export function TicketList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useMyTickets(page);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (error) {
      toast.error("Error al cargar entradas", {
        description:
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las entradas",
      });
    }
  }, [error]);

  if (isLoading) {
    return (
      <Grid
        templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" }}
        gap={6}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height="280px" borderRadius="2xl" />
        ))}
      </Grid>
    );
  }

  if (!data || data.data.length === 0) {
    return <EmptyTickets />;
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
              Tus accesos
            </Text>
            <Text color="white" fontSize="3xl" fontWeight="black">
              Mis Entradas
            </Text>
          </Stack>

          <Box
            px={4}
            py={2}
            borderRadius="xl"
            bg="rgba(0,229,255,0.08)"
            border="1px solid rgba(0,229,255,0.16)"
          >
            <Text color="brand.cyan" fontWeight="bold">
              {data.total} {data.total === 1 ? "entrada" : "entradas"}
            </Text>
          </Box>
        </Stack>
      </motion.div>

      <Grid
        templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" }}
        gap={6}
      >
        {data.data.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </Grid>

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
