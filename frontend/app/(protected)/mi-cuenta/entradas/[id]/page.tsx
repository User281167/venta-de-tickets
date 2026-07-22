"use client";

import { use } from "react";
import {
  Box,
  Heading,
  HStack,
  Skeleton,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { IconArrowLeft, IconCircleX } from "@tabler/icons-react";
import { useMyTicketById } from "@/features/users/hooks/useMyTickets";
import { TicketInformation } from "@/features/users/components/TicketInformation";

export default function EntradaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const query = useMyTicketById(id);

  if (query.isLoading) {
    return (
      <Box minH="60vh" px={4} py={8} maxW="640px" mx="auto">
        <Stack gap={4}>
          <Skeleton height="32px" width="60%" />
          <Skeleton height="200px" />
          <Skeleton height="60px" />
        </Stack>
      </Box>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Box
        minH="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={4}
        py={8}
      >
        <VStack
          maxW="480px"
          w="full"
          bg="brand.panel"
          borderRadius="2xl"
          p={8}
          border="1px solid"
          borderColor="rgba(255,255,255,0.08)"
          textAlign="center"
          gap={4}
        >
          <Box
            p={4}
            borderRadius="full"
            bg="rgba(239,68,68,0.08)"
            border="1px solid rgba(239,68,68,0.25)"
            display="inline-flex"
          >
            <IconCircleX size={48} color="#ef4444" />
          </Box>

          <Heading as="h1" size="lg" color="white">
            Entrada no encontrada
          </Heading>

          <Text color="brand.muted" fontSize="sm">
            No pudimos cargar esta entrada. Verifica el enlace o inicia sesión
            con la cuenta correcta.
          </Text>

          <NextLink
            href="/mi-cuenta/entradas"
            style={{ color: "#00e5ff", fontSize: 14, fontWeight: 700 }}
          >
            <HStack gap={1} justify="center">
              <IconArrowLeft size={16} />
              <Text color="brand.cyan" fontWeight="bold" fontSize="sm">
                Volver a mis entradas
              </Text>
            </HStack>
          </NextLink>
        </VStack>
      </Box>
    );
  }

  return <TicketInformation ticket={query.data} />;
}
