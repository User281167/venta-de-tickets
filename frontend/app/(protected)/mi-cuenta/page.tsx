"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { Heading, Text, VStack, Box } from "@chakra-ui/react";

export default function MiCuentaPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Text textAlign="center" mt={10}>
        Cargando...
      </Text>
    );
  }

  return (
    <Box maxW="md" mx="auto" mt={10} p={6}>
      <VStack gap={4} align="stretch">
        <Heading as="h1" size="lg">
          Mi cuenta
        </Heading>

        <Text>Bienvenido, {user?.email ?? "usuario"}</Text>
      </VStack>
    </Box>
  );
}
