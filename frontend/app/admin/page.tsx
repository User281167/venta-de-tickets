"use client";

import { Box, Button, Container, Heading, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import { DonationCounter } from "@/features/donaciones/components/DonationCounter";
import { useAuth } from "@/providers/AuthProvider";

export default function AdminDashboard() {
  const { user, role, isLoading } = useAuth();

  if (isLoading) return <Text color="brand.muted">Cargando...</Text>;

  return (
    <Container maxW="4xl" py={{ base: 8, md: 12 }}>
      <VStack align="stretch" gap={8}>
        <Box>
          <Text color="#f5bd35" fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing=".16em">UTPton · Administración</Text>
          <Heading as="h1" color="white" mt={2}>Gestión de donaciones</Heading>
          <Text color="brand.muted" mt={3}>Sesión: {user?.email ?? "Personal autorizado"} · {role}</Text>
        </Box>
        <DonationCounter />
        <Button asChild w="fit-content" bg="#f5bd35" color="#07152b" _hover={{ bg: "#ffd46d" }}>
          <NextLink href="/admin/donaciones">Ver donaciones y ajustar la meta</NextLink>
        </Button>
      </VStack>
    </Container>
  );
}
