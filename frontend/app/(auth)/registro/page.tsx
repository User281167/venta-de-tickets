"use client";

import {
  Box,
  Flex,
  Heading,
  Link as ChakraLink,
  Stack,
  Text,
  Image,
} from "@chakra-ui/react";
import { IconArrowLeft } from "@tabler/icons-react";

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
    <Flex
      align="center"
      justify="center"
      minH="100vh"
      minW="100%"
      background="url(/header.png) center/cover no-repeat"
      position="relative"
    >
      <Box position="absolute" inset={0} bg="rgba(0, 0, 0, 0.55)" />

      <Flex
        position="relative"
        zIndex={1}
        minH="100%"
        w="full"
        justify="space-around"
      >
        <Flex gap="4" align="center" hideBelow="xl">
          <Image src="/la-u.png" w="sm" />

          <Stack>
            <Heading
              as="h1"
              fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
              color="white"
              lineHeight="0.95"
              fontWeight="black"
              textTransform="uppercase"
            >
              del futuro
            </Heading>

            <Text
              fontSize={{ base: "lg", md: "2xl" }}
              color="white"
              textTransform="uppercase"
              lineHeight="1.35"
            >
              Conectamos{" "}
              <Box as="span" color="brand.pink">
                talento
              </Box>
              ,<br /> impulsamos el{" "}
              <Box as="span" color="brand.cyan">
                futuro
              </Box>
            </Text>
          </Stack>
        </Flex>

        <Box
          borderWidth={1}
          borderColor="rgba(255,255,255,0.2)"
          borderRadius="2xl"
          p={8}
          bg="rgba(255,255,255,0.2)"
          backdropFilter="blur(24px)"
        >
          <RegisterForm />

          <Text textAlign="center" fontSize="sm" color="white" mt={4}>
            ¿Ya tienes cuenta?{" "}
            <ChakraLink asChild color="brand.teal" fontWeight="medium">
              <NextLink href="/login">Iniciar sesión</NextLink>
            </ChakraLink>
          </Text>
        </Box>
      </Flex>

      <ChakraLink asChild position="absolute" top={4} right={4} color="white">
        <NextLink href="/" aria-label="Cerrar">
          <IconArrowLeft size={24} />
        </NextLink>
      </ChakraLink>
    </Flex>
  );
}
