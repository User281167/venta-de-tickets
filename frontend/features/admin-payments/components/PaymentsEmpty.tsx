"use client";

import { Box, Text } from "@chakra-ui/react";

export function PaymentsEmpty() {
  return (
    <Box textAlign="center" py={10}>
      <Text color="brand.muted" fontSize="lg">
        No se encontraron pagos
      </Text>

      <Text color="brand.muted" fontSize="sm" mt={1}>
        Intenta ajustar los filtros de búsqueda.
      </Text>
    </Box>
  );
}
