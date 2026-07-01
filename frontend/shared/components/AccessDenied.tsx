"use client";

import { Button, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";

export function AccessDenied() {
  return (
    <Flex flex={1} align="center" justify="center" minH="50vh">
      <VStack gap={4} textAlign="center">
        <Heading size="xl" color="red.500">
          Acceso denegado
        </Heading>

        <Text color="gray.600" maxW="md">
          No tienes permisos para acceder a esta sección. Contacta al
          administrador si crees que esto es un error.
        </Text>

        <Button asChild colorPalette="teal">
          <NextLink href="/admin">Volver al panel</NextLink>
        </Button>
      </VStack>
    </Flex>
  );
}
