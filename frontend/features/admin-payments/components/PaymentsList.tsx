"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { IconRotate } from "@tabler/icons-react";
import { motion, useReducedMotion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { usePayments } from "../api/admin-payments.queries";
import { PaymentsTable } from "./PaymentsTable";
import { PaymentsTableSkeleton } from "./PaymentsTableSkeleton";
import { PaymentsError } from "./PaymentsError";
import { PaymentsEmpty } from "./PaymentsEmpty";
import { PaymentFilters } from "./PaymentFilters";

const LIMIT = 25;

export function PaymentsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const reduced = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError } = usePayments({
    page,
    limit: LIMIT,
    search: search || undefined,
    status: status || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;

  const handlePrevPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }, []);

  const hasActiveFilters = !!(status || dateFrom || dateTo || search);

  return (
    <VStack align="stretch" w="full" minW={0} gap={8}>
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack gap={1}>
          <Text
            color="brand.cyan"
            fontSize="sm"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.15em"
          >
            Administración
          </Text>
          <Heading as="h1" size="2xl" color="white" lineHeight="1.1">
            Pagos
          </Heading>
          <Text color="brand.muted" maxW="600px">
            Revisa el historial de pagos, filtra por estado o fecha y accede al
            detalle de cada transacción.
          </Text>
        </Stack>
      </motion.div>

      <PaymentFilters
        search={searchInput}
        status={status}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onSearchChange={setSearchInput}
        onStatusChange={setStatus}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      {isError && (
        <PaymentsError>
          No se pudieron cargar los pagos. Verifica que tengas permisos de
          administrador.
        </PaymentsError>
      )}

      {isLoading && <PaymentsTableSkeleton />}

      {data && data.data.length === 0 && (
        <VStack gap={4}>
          <PaymentsEmpty />

          {hasActiveFilters && (
            <Box textAlign="center">
              <Button
                variant="outline"
                size="sm"
                color="white"
                borderColor="rgba(255,255,255,0.16)"
                borderRadius="xl"
                _hover={{ bg: "rgba(255,255,255,0.06)" }}
                onClick={clearFilters}
              >
                <HStack gap={2}>
                  <IconRotate size={16} />
                  <Text>Limpiar filtros</Text>
                </HStack>
              </Button>
            </Box>
          )}
        </VStack>
      )}

      {data && data.data.length > 0 && (
        <VStack align="stretch" gap={6}>
          <PaymentsTable payments={data.data} />

          <Flex
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={4}
          >
            <Text fontSize="sm" color="brand.muted">
              {data.total} pago(s) — Página {page} de {totalPages}
            </Text>

            <HStack gap={2}>
              <Button
                size="sm"
                variant="outline"
                color="white"
                borderColor="rgba(255,255,255,0.16)"
                borderRadius="xl"
                disabled={page <= 1}
                onClick={handlePrevPage}
                _hover={{ bg: "rgba(255,255,255,0.06)" }}
              >
                Anterior
              </Button>

              <Button
                size="sm"
                variant="outline"
                color="white"
                borderColor="rgba(255,255,255,0.16)"
                borderRadius="xl"
                disabled={page >= totalPages}
                onClick={handleNextPage}
                _hover={{ bg: "rgba(255,255,255,0.06)" }}
              >
                Siguiente
              </Button>
            </HStack>
          </Flex>
        </VStack>
      )}
    </VStack>
  );
}
