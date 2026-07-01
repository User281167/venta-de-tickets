"use client";

import { Heading, Text, VStack } from "@chakra-ui/react";
import { useAdmin } from "@/features/admin-auth/hooks/useAdmin";

export default function AdminDashboard() {
  const { admin, isLoading } = useAdmin();

  if (isLoading) {
    return <Text>Cargando...</Text>;
  }

  return (
    <VStack align="stretch" gap={4}>
      <Heading as="h1" size="lg">
        Panel de administración
      </Heading>

      <Text color="gray.600">
        Bienvenido{admin?.name ? `, ${admin.name}` : ""}. Rol:{" "}
        <strong>{admin?.role}</strong>
      </Text>

      <Text color="gray.500" fontSize="sm">
        Selecciona una sección del menú lateral para comenzar.
      </Text>
    </VStack>
  );
}
