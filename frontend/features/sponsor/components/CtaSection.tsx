"use client";

import { Box, Container, Heading, HStack, Stack, Text, chakra } from "@chakra-ui/react";
import { IconMail, IconAffiliate } from "@tabler/icons-react";
import NextLink from "next/link";

const LinkButton = chakra(NextLink, {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    rounded: "full",
    px: 8,
    py: 3,
    fontFamily: "body",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    fontSize: "sm",
    transition: "all 0.2s",
  },
});

export function CtaSection() {
  return (
    <Box
      as="section"
      id="aliados"
      position="relative"
      overflow="hidden"
      bg="utp.noche"
      color="utp.artico"
      py={{ base: 16, md: 24 }}
    >
      <Box
        position="absolute"
        inset={0}
        opacity={0.5}
        backgroundImage="radial-gradient(circle at 80% 30%, rgba(57,255,99,0.18), transparent 50%), radial-gradient(circle at 20% 80%, rgba(0,194,255,0.18), transparent 50%)"
        pointerEvents="none"
      />

      <Container maxW="5xl" position="relative">
        <Stack
          gap={6}
          p={{ base: 8, md: 12 }}
          rounded="3xl"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          bg="whiteAlpha.50"
          textAlign="center"
          align="center"
        >
          <HStack
            gap={2}
            px={3}
            py={1}
            rounded="full"
            bg="utp.verde"
            color="utp.noche"
          >
            <IconAffiliate size={14} />
            <Text textStyle="eyebrow">Aliados 2026</Text>
          </HStack>

          <Heading
            as="h2"
            textStyle="sectionTitle"
            style={{ textWrap: "balance" }}
          >
            Súmate a la U del futuro
          </Heading>
          <Text
            fontFamily="body"
            fontSize={{ base: "md", md: "lg" }}
            color="utp.artico"
            opacity={0.8}
            maxW="2xl"
          >
            Conecta tu marca con miles de egresados, estudiantes, docentes y
            aliados UTP. Construyamos juntos una experiencia que transforme la
            conversación sobre IA, innovación y futuro.
          </Text>

          <HStack gap={3} flexWrap="wrap" justify="center">
            <LinkButton
              href="/contacto"
              bg="utp.azul"
              color="utp.noche"
              _hover={{ bg: "white" }}
            >
              <IconMail size={18} />
              <Box as="span">Quiero ser aliado</Box>
            </LinkButton>
            <LinkButton
              href="/"
              bg="transparent"
              color="utp.artico"
              borderWidth="1px"
              borderColor="whiteAlpha.400"
              _hover={{ bg: "whiteAlpha.100" }}
            >
              <Box as="span">Volver al inicio</Box>
            </LinkButton>
          </HStack>
        </Stack>
      </Container>
    </Box>
  );
}
