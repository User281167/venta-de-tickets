"use client";

import { Box, Link as ChakraLink, Text } from "@chakra-ui/react";
import { IconHome } from "@tabler/icons-react";
import NextLink from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <Box borderWidth={1} borderColor="rgba(255,255,255,0.2)" borderRadius="2xl" p={8} bg="rgba(255,255,255,0.2)" backdropFilter="blur(24px)" w="md" position="relative">
      <Text color="white" fontSize="sm" textAlign="center" mb={5}>
        Acceso reservado al equipo administrativo.
      </Text>
      <LoginForm />
      <ChakraLink asChild position="absolute" top={4} left={4} color="white">
        <NextLink href="/" aria-label="Volver al inicio">
          <IconHome size={24} />
          <span>Volver</span>
        </NextLink>
      </ChakraLink>
    </Box>
  );
}
