"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Container,
  Heading,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { fetchPolicyContent } from "@/features/users/api/users.client";

const PRIVACY_KEY = ["policy", "privacy_policy"] as const;

export default function PrivacidadPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: PRIVACY_KEY,
    queryFn: () => fetchPolicyContent("privacy_policy"),
    staleTime: 1000 * 60 * 30,
  });

  if (isLoading) {
    return (
      <Container maxW="3xl" py={10} pt="20">
        <Stack gap={4}>
          <Skeleton height="32px" width="60%" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" width="90%" />
        </Stack>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxW="3xl" py={10} pt="20">
        <Heading size="lg" mb={4}>
          Política de privacidad
        </Heading>
        <Text color="gray.400">
          No se pudo cargar el contenido. Intenta de nuevo más tarde.
        </Text>
      </Container>
    );
  }

  return (
    <Container maxW="3xl" py={10} pt="20">
      <Box mb={6}>
        <Heading as="h1" size="xl" mb={2}>
          Política de privacidad
        </Heading>
        <Text color="gray.500" fontSize="sm">
          Versión {data.version} · Publicada el{" "}
          {new Date(data.publishedAt).toLocaleDateString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </Box>
      <Box
        as="pre"
        whiteSpace="pre-wrap"
        fontFamily="body"
        fontSize="md"
        lineHeight="1.7"
        color="gray.200"
      >
        {data.content}
      </Box>
    </Container>
  );
}
