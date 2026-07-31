"use client";

import { Box, Text } from "@chakra-ui/react";
import { IconHeart } from "@tabler/icons-react";

export function DonationsEmpty() {
  return (
    <Box textAlign="center" py={16}>
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
        <IconHeart size={36} color="#ff0f7b" />
      </Box>
      <Text color="white" fontSize="xl" fontWeight="bold" mb={2}>
        No se encontraron donaciones
      </Text>
      <Text color="brand.muted" maxW="400px" mx="auto">
        Intenta ajustar los filtros de búsqueda.
      </Text>
    </Box>
  );
}
