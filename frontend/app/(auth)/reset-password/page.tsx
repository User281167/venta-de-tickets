"use client";

import { Box, Link as ChakraLink, Text } from "@chakra-ui/react";
import { IconHome } from "@tabler/icons-react";
import NextLink from "next/link";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
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
      <ForgotPasswordForm />

      <Text textAlign="center" fontSize="sm" color="white" mt={6}>
        ¿Recordaste tu contraseña?{" "}
        <ChakraLink asChild color="brand.teal" fontWeight="medium">
          <NextLink href="/login">Iniciar sesión</NextLink>
        </ChakraLink>
      </Text>

      <ChakraLink asChild position="absolute" top={4} left={4} color="white">
        <NextLink href="/" aria-label="Volver al inicio">
          <IconHome size={24} />
          <span>Volver</span>
        </NextLink>
      </ChakraLink>
    </Box>
  );
}
