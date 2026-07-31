"use client";

import { Box, Heading, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { IconHistory } from "@tabler/icons-react";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { useAuditLog } from "../api/audit.queries";
import { AuditLogTable } from "./AuditLogTable";
import { AuditLogTableSkeleton } from "./AuditLogTableSkeleton";
import { AuditLogEmpty } from "./AuditLogEmpty";
import { AuditLogFilters } from "./AuditLogFilters";
import type { AuditEntityType } from "../types";

const LIMIT = 50;

export function AuditLogList() {
  const [entityType, setEntityType] = useState<AuditEntityType | null>(null);
  const reduced = useReducedMotion();

  const { data, isLoading, isError } = useAuditLog({
    entityType: entityType ?? undefined,
    limit: LIMIT,
  });

  // T024: client-side filter fallback when user changes the chip before the
  // request round-trips, or to refine what the server returned.
  const visibleEntries = useMemo(() => {
    if (!data) return [];
    if (!entityType) return data.data;
    return data.data.filter((entry) => entry.entityType === entityType);
  }, [data, entityType]);

  return (
    <VStack align="stretch" w="full" minW={0} gap={8}>
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack gap={1}>
          <HStack gap={2}>
            <IconHistory size={18} color="#0d9488" />
            <Text
              color="utp.azul"
              fontSize="sm"
              fontWeight="black"
              textTransform="uppercase"
              letterSpacing="0.15em"
            >
              Administración
            </Text>
          </HStack>
          <Heading as="h1" size="2xl" color="white" lineHeight="1.1">
            Auditoría
          </Heading>
          <Text color="brand.muted" maxW="600px">
            Historial de acciones del personal sobre el sistema. Se actualiza
            automáticamente cada 4 segundos.
          </Text>
        </Stack>
      </motion.div>

      <AuditLogFilters
        selected={entityType}
        onChange={setEntityType}
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
            No se pudo cargar el historial de auditoría. Verifica que tengas
            permisos de super administrador.
          </Text>
        </Box>
      )}

      {isLoading && <AuditLogTableSkeleton />}

      {data && visibleEntries.length === 0 && <AuditLogEmpty />}

      {data && visibleEntries.length > 0 && (
        <VStack align="stretch" gap={4}>
          <AuditLogTable entries={visibleEntries} />
          {data.hasMore && (
            <Text color="brand.muted" fontSize="xs" textAlign="center">
              Mostrando {visibleEntries.length} entradas más recientes. Hay
              más disponibles.
            </Text>
          )}
        </VStack>
      )}
    </VStack>
  );
}
