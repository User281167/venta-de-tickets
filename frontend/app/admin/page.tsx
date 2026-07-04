"use client";

import { Heading, Text, VStack } from "@chakra-ui/react";
import { useAdmin } from "@/features/admin-auth/hooks/useAdmin";

export default function AdminDashboard() {
  const { admin, isLoading } = useAdmin();

  if (isLoading) {
    return <Text>Cargando...</Text>;
  }

  return (
    <VStack align="stretch" gap={4} color="white">
      <Heading as="h1" size="lg">
        Panel de administración
      </Heading>

      <Text color="gray.400">
        Bienvenido{admin?.email ? `, ${admin.email}` : ""}. Rol:{" "}
        <strong>{admin?.role}</strong>
      </Text>

      <Text color="gray.200" fontSize="sm">
        Selecciona una sección del menú lateral para comenzar.
      </Text>
    </VStack>
  );
}
