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
import { IconRotate, IconSettings } from "@tabler/icons-react";
import { motion, useReducedMotion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useDonations } from "../api/admin-donations.queries";
import { DonationsTable } from "./DonationsTable";
import { DonationsTableSkeleton } from "./DonationsTableSkeleton";
import { DonationsEmpty } from "./DonationsEmpty";
import { DonationsFilters } from "./DonationsFilters";
import { MetaDonationModal } from "./MetaDonationModal";

const LIMIT = 25;

export function DonationsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [state, setState] = useState("");
  const [account, setAccount] = useState("");
  const [metaModalOpen, setMetaModalOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [state, account]);

  const { data, isLoading, isError } = useDonations({
    page,
    limit: LIMIT,
    search: search || undefined,
    state: (state || undefined) as
      | "pending"
      | "confirmed"
      | "rejected"
      | "cancelled"
      | undefined,
    account: (account || undefined) as
      | "LA_CONVENCION"
      | "BARRANQUEROS_UTP"
      | undefined,
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
    setState("");
    setAccount("");
    setPage(1);
  }, []);

  const hasActiveFilters = !!(state || account || search);

  return (
    <VStack align="stretch" w="full" minW={0} gap={8}>
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Flex justify="space-between" align="flex-end" gap={4} wrap="wrap">
          <Stack gap={1}>
            <Text
              color="utp.azul"
              fontSize="sm"
              fontWeight="black"
              textTransform="uppercase"
              letterSpacing="0.15em"
            >
              Administración
            </Text>

            <Heading as="h1" size="2xl" color="white" lineHeight="1.1">
              Donaciones
            </Heading>

            <Text color="brand.muted" maxW="600px">
              Revisa el historial de donaciones, filtra por estado o cuenta y
              consulta los detalles de cada aporte.
            </Text>
          </Stack>

          <Button
            variant="outline"
            color="white"
            borderColor="rgba(255,255,255,0.16)"
            borderRadius="xl"
            _hover={{ bg: "rgba(255,255,255,0.06)" }}
            onClick={() => setMetaModalOpen(true)}
          >
            <HStack gap={2}>
              <IconSettings size={16} />
              <Text>Configurar meta</Text>
            </HStack>
          </Button>
        </Flex>
      </motion.div>

      <DonationsFilters
        search={searchInput}
        state={state}
        account={account}
        onSearchChange={setSearchInput}
        onStateChange={setState}
        onAccountChange={setAccount}
      />

      {isError && (
        <Box
          w="full"
          p={4}
          borderRadius="xl"
          bg="rgba(239,68,68,0.1)"
          border="1px solid rgba(239,68,68,0.3)"
        >
          <Text color="white" fontWeight="bold" fontSize="sm">
            No se pudieron cargar las donaciones. Verifica que tengas permisos
            de administrador.
          </Text>
        </Box>
      )}

      {isLoading && <DonationsTableSkeleton />}

      {data && data.data.length === 0 && (
        <VStack gap={4}>
          <DonationsEmpty />

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
          <DonationsTable donations={data.data} />

          <Flex
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={4}
          >
            <Text fontSize="sm" color="brand.muted">
              {data.total} donación(es) — Página {page} de {totalPages}
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

      <MetaDonationModal
        open={metaModalOpen}
        onClose={() => setMetaModalOpen(false)}
      />
    </VStack>
  );
}
