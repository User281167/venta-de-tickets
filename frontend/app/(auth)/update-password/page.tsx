"use client";

import { Box } from "@chakra-ui/react";
import { IconHome } from "@tabler/icons-react";
import NextLink from "next/link";
import { Link as ChakraLink } from "@chakra-ui/react";
import { UpdatePasswordForm } from "@/features/auth/components/UpdatePasswordForm";

export default function UpdatePasswordPage() {
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
      <UpdatePasswordForm />

      <ChakraLink asChild position="absolute" top={4} left={4} color="white">
        <NextLink href="/" aria-label="Volver al inicio">
          <IconHome size={24} />
          <span>Volver</span>
        </NextLink>
      </ChakraLink>
    </Box>
  );
}
