"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
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
    <VStack align="stretch" w="full" spaceY={4}>
      <Heading as="h1" size="lg" color="brand.light">
        Pagos
      </Heading>

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
        <>
          <PaymentsEmpty />

          {hasActiveFilters && (
            <Box textAlign="center">
              <Button
                variant="outline"
                size="sm"
                color="white"
                _hover={{ color: "black" }}
                onClick={clearFilters}
              >
                Limpiar filtros
              </Button>
            </Box>
          )}
        </>
      )}

      {data && data.data.length > 0 && (
        <Box spaceY={2}>
          <PaymentsTable payments={data.data} />

          <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
            <Text fontSize="sm" color="brand.muted">
              {data.total} pago(s) — Página {page} de {totalPages}
            </Text>

            <HStack gap={2}>
              <Button size="sm" disabled={page <= 1} onClick={handlePrevPage}>
                Anterior
              </Button>

              <Button
                size="sm"
                disabled={page >= totalPages}
                onClick={handleNextPage}
              >
                Siguiente
              </Button>
            </HStack>
          </Flex>
        </Box>
      )}
    </VStack>
  );
}
