"use client";

import { Box, Link as ChakraLink, Text } from "@chakra-ui/react";
import { IconHome } from "@tabler/icons-react";

import NextLink from "next/link";
import { useRouter } from "next/navigation";

import { LoginForm } from "@/features/auth/components/LoginForm";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { adminFetch } from "@/shared/api/admin-fetch";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (!isLoading && user) {
    adminFetch<{ role: string | null }>("/api/auth/session")
      .then(({ role }) => {
        if (role == "client") {
          router.replace("/mi-cuenta");
        } else {
          router.replace("/admin");
        }
      })
      .catch(() => router.replace("/mi-cuenta"));

    return null;
  }

  return (
    <Box
      borderWidth={1}
      borderColor="rgba(255,255,255,0.2)"
      borderRadius="2xl"
      p={8}
      bg="rgba(255,255,255,0.2)"
      backdropFilter="blur(24px)"
      w="md"
      position="relative"
    >
      <LoginForm />

      <Text textAlign="center" fontSize="sm" color="white" mt={4}>
        ¿No tienes cuenta?{" "}
        <ChakraLink asChild color="brand.teal" fontWeight="medium">
          <NextLink href="/registro">Crear cuenta</NextLink>
        </ChakraLink>
      </Text>

      <ChakraLink asChild position="absolute" top={4} left={4} color="white">
        <NextLink href="/" aria-label="Cerrar">
          <IconHome size={24} />

          <span>Volver</span>
        </NextLink>
      </ChakraLink>
    </Box>
  );
}
