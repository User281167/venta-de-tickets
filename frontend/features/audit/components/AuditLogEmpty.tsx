"use client";

import { Box, Text, VStack } from "@chakra-ui/react";
import { IconHistory } from "@tabler/icons-react";

export function AuditLogEmpty() {
  return (
    <Box
      w="full"
      p={12}
      borderRadius="xl"
      border="1px dashed"
      borderColor="rgba(255,255,255,0.16)"
      bg="rgba(255,255,255,0.02)"
    >
      <VStack gap={3}>
        <IconHistory size={32} color="#71717a" />
        <Text color="white" fontSize="md" fontWeight="bold">
          No hay acciones registradas
        </Text>
        <Text color="brand.muted" fontSize="sm" textAlign="center" maxW="400px">
          Las acciones del personal sobre tipos de entrada, tickets, pagos y
          descuentos aparecerán aquí en tiempo real.
        </Text>
      </VStack>
    </Box>
  );
}
