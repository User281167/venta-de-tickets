"use client";

import {
  Box,
  Flex,
  HStack,
  Heading,
  IconButton,
  Link as ChakraLink,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  IconArrowLeft,
  IconBrain,
  IconCertificate,
  IconGift,
  IconHeartHandshake,
  IconRocket,
} from "@tabler/icons-react";
import NextLink from "next/link";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <Flex
      align="center"
      justify="center"
      minH="100vh"
      background="url(/conferencia-1.jpg) center/cover no-repeat"
      position="relative"
    >
      <Box position="absolute" inset={0} bg="rgba(48, 56, 65, 0.55)" />

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
              Únete al futuro
            </Heading>

            <Text fontSize="lg" color="gray.200" lineHeight="1.7">
              Crea tu cuenta y asegura tu lugar en el evento académico más
              importante del año. Charlas, talleres y networking con líderes de
              la industria.
            </Text>

            <Stack gap={5} pt={4}>
              <Flex gap={3} align="center">
                <Flex
                  w={6}
                  h={6}
                  bg="rgba(118,171,174,0.2)"
                  borderRadius="full"
                  align="center"
                  justify="center"
                >
                  <IconRocket size={14} color="#76ABAE" />
                </Flex>
                <Text color="gray.300" fontSize="sm">
                  Acceso a todas las conferencias
                </Text>
              </Flex>
              <Flex gap={3} align="center">
                <Flex
                  w={6}
                  h={6}
                  bg="rgba(118,171,174,0.2)"
                  borderRadius="full"
                  align="center"
                  justify="center"
                >
                  <IconCertificate size={14} color="#76ABAE" />
                </Flex>
                <Text color="gray.300" fontSize="sm">
                  Certificado universitario digital
                </Text>
              </Flex>
              <Flex gap={3} align="center">
                <Flex
                  w={6}
                  h={6}
                  bg="rgba(118,171,174,0.2)"
                  borderRadius="full"
                  align="center"
                  justify="center"
                >
                  <IconHeartHandshake size={14} color="#76ABAE" />
                </Flex>
                <Text color="gray.300" fontSize="sm">
                  Networking con profesionales
                </Text>
              </Flex>
              <Flex gap={3} align="center">
                <Flex
                  w={6}
                  h={6}
                  bg="rgba(118,171,174,0.2)"
                  borderRadius="full"
                  align="center"
                  justify="center"
                >
                  <IconGift size={14} color="#76ABAE" />
                </Flex>
                <Text color="gray.300" fontSize="sm">
                  Sorteos y material exclusivo
                </Text>
              </Flex>
            </Stack>
          </Stack>
        </Flex>

        <Flex flex={1} align="center" justify="center" position="relative">
          <NextLink href="/" passHref>
            <ChakraLink position="absolute" top={4} right={4}>
              <IconButton
                aria-label="Cerrar"
                variant="ghost"
                size="md"
                color="white"
              >
                <IconArrowLeft size={24} />
              </IconButton>
            </ChakraLink>
          </NextLink>

          <Box w="full" maxW="500px" mx="auto" px={4} position="relative">
            <Box
              position="absolute"
              top="-40px"
              right="-40px"
              w="200px"
              h="200px"
              bg="rgba(118,171,174,0.15)"
              borderRadius="full"
              filter="blur(60px)"
              pointerEvents="none"
            />
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
              <RegisterForm />
            </Box>

            <Text textAlign="center" fontSize="sm" color="white" mt={4}>
              ¿Ya tienes cuenta?{" "}
              <NextLink href="/login" passHref>
                <ChakraLink color="brand.teal" fontWeight="medium">
                  Iniciar sesión
                </ChakraLink>
              </NextLink>
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
}
