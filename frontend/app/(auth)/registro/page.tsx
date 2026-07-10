"use client";

import {
  Box,
  Link as ChakraLink,
  Text,
} from "@chakra-ui/react";
import { IconHome } from "@tabler/icons-react";

import NextLink from "next/link";
import { useRouter } from "next/navigation";

import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function RegisterPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (!isLoading && user) {
    router.replace("/mi-cuenta");
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
    >
      <ChakraLink asChild position="absolute" top={4} left={4} color="white">
        <NextLink href="/" aria-label="Cerrar">
          <IconHome size={24} />

          <span>Volver</span>
        </NextLink>
      </ChakraLink>

      <RegisterForm />

      <Text textAlign="center" fontSize="sm" color="white" mt={4}>
        ¿Ya tienes cuenta?{" "}
        <ChakraLink asChild color="brand.teal" fontWeight="medium">
          <NextLink href="/login">Iniciar sesión</NextLink>
        </ChakraLink>
      </Text>
    </Box>
  );
}
