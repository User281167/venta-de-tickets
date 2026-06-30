"use client";

import {
  Box,
  Flex,
  HStack,
  Heading,
  Link as ChakraLink,
  Stack,
  Text,
} from "@chakra-ui/react";
import { IconArrowLeft, IconBrain } from "@tabler/icons-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (!isLoading && user) {
    router.replace("/mi-cuenta");
    return null;
  }

  return (
    <Flex
      align="center"
      justify="center"
      minH="100vh"
      background="url(/conferencia-2.jpg) center/cover no-repeat"
      position="relative"
    >
      <Box position="absolute" inset={0} bg="rgba(48, 56, 65, 0.5)" />

      <Flex position="relative" zIndex={1} minH="100vh" w="full">
        <Flex
          flex={1}
          display={{ base: "none", md: "flex" }}
          align="center"
          justify="center"
        >
          <Stack maxW="md" px={8} gap={6}>
            <HStack gap={3}>
              <IconBrain size={40} color="#76ABAE" />

              <Text fontSize="2xl" fontWeight="bold" color="white">
                Future Minds 2026
              </Text>
            </HStack>

            <Heading as="h1" size="2xl" color="white" lineHeight="1.2">
              Ideas que están cambiando el mundo
            </Heading>

            <Text fontSize="lg" color="gray.200" lineHeight="1.7">
              Accede a tu cuenta para gestionar tu entrada, guardar tu agenda y
              conectar con los speakers antes del evento.
            </Text>

            <Stack gap={4} pt={4}>
              <Flex gap={3} align="center">
                <Box w={2} h={2} bg="brand.teal" borderRadius="full" />

                <Text color="gray.300" fontSize="sm">
                  Charlas con líderes globales
                </Text>
              </Flex>

              <Flex gap={3} align="center">
                <Box w={2} h={2} bg="brand.teal" borderRadius="full" />

                <Text color="gray.300" fontSize="sm">
                  Networking exclusivo
                </Text>
              </Flex>

              <Flex gap={3} align="center">
                <Box w={2} h={2} bg="brand.teal" borderRadius="full" />

                <Text color="gray.300" fontSize="sm">
                  Certificado universitario
                </Text>
              </Flex>
            </Stack>
          </Stack>
        </Flex>

        <Flex flex={1} align="center" justify="center" position="relative">
          <ChakraLink
            asChild
            position="absolute"
            top={4}
            right={4}
            color="white"
          >
            <NextLink href="/" aria-label="Cerrar">
              <IconArrowLeft size={24} />
            </NextLink>
          </ChakraLink>

          <Box w="full" maxW="500px" mx="auto" px={4} position="relative">
            <Box position="absolute" bg="rgba(118,171,174,0.15)" />

            <Box
              position="absolute"
              bottom="-30px"
              left="-30px"
              w="150px"
              h="150px"
              bg="rgba(180,190,195,0.15)"
              borderRadius="full"
              filter="blur(50px)"
              pointerEvents="none"
            />

            <Box
              borderWidth={1}
              borderColor="rgba(255,255,255,0.2)"
              borderRadius="2xl"
              p={8}
              bg="rgba(255,255,255,0.2)"
              backdropFilter="blur(24px)"
              position="relative"
            >
              <LoginForm />
            </Box>

            <Text textAlign="center" fontSize="sm" color="white" mt={4}>
              ¿No tienes cuenta?{" "}
              <ChakraLink asChild color="brand.teal" fontWeight="medium">
                <NextLink href="/registro">Crear cuenta</NextLink>
              </ChakraLink>
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
}
