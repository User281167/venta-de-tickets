"use client";

import {
  Box,
  Container,
  Heading,
  HStack,
  Image,
  Stack,
  Text,
  chakra,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { IconArrowRight, IconSparkles } from "@tabler/icons-react";

const LOGO_VERTICAL = "/logos-la-u/Vertical - letras azules.png";

const LinkButton = chakra(NextLink, {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    px: 6,
    py: 3,
    rounded: "full",
    fontFamily: "body",
    fontWeight: "700",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    fontSize: "sm",
    transition: "all 0.2s",
  },
});

export function SponsorHero() {
  return (
    <Box
      as="section"
      position="relative"
      overflow="hidden"
      bg="utp.noche"
      color="utp.artico"
      pt={{ base: 24, md: 32 }}
      pb={{ base: 16, md: 24 }}
      borderBottomWidth="1px"
      borderColor="whiteAlpha.100"
    >
      <Box
        position="absolute"
        inset={0}
        opacity={0.35}
        backgroundImage="radial-gradient(circle at 18% 22%, rgba(0,194,255,0.25), transparent 45%), radial-gradient(circle at 82% 78%, rgba(160,16,96,0.28), transparent 50%)"
        pointerEvents="none"
      />

      <Container maxW="7xl" position="relative">
        <Stack gap={{ base: 8, md: 12 }} align="center" textAlign="center">
          <HStack
            gap={2}
            px={4}
            py={2}
            rounded="full"
            borderWidth="1px"
            borderColor="utp.azul"
            bg="whiteAlpha.50"
            color="utp.azul"
            textStyle="eyebrow"
          >
            <IconSparkles size={14} />
            <Text>XXIV Convención de Egresados UTP · 2026</Text>
          </HStack>

          <Image
            src={LOGO_VERTICAL}
            alt="Logo La U del Futuro — XXIV Convención de Egresados UTP 2026"
            h={{ base: "220px", md: "320px", lg: "380px" }}
            w="auto"
            objectFit="contain"
            loading="eager"
          />

          <Stack gap={4} maxW="3xl">
            <Heading
              as="h1"
              textStyle="hero"
              color="utp.artico"
              style={{ textWrap: "balance" }}
            >
              La U del futuro
            </Heading>
            <Text
              fontFamily="body"
              fontSize={{ base: "md", md: "lg" }}
              color="utp.artico"
              opacity={0.78}
              lineHeight="1.6"
            >
              Una identidad que reúne generaciones alrededor de la IA. Pertenencia
              universitaria, mirada de futuro y apertura tecnológica, sin perder
              cercanía institucional.
            </Text>
          </Stack>

          <HStack gap={3} flexWrap="wrap" justify="center">
            <LinkButton
              href="#pilares"
              bg="utp.azul"
              color="utp.noche"
              _hover={{ bg: "white", color: "utp.noche" }}
            >
              <HStack gap={2}>
                <Box as="span">Conoce la marca</Box>
                <IconArrowRight size={16} />
              </HStack>
            </LinkButton>
            <LinkButton
              href="#aliados"
              bg="transparent"
              borderWidth="1px"
              borderColor="whiteAlpha.400"
              color="utp.artico"
              _hover={{ bg: "whiteAlpha.100" }}
            >
              <Box as="span">Quiero ser aliado</Box>
            </LinkButton>
          </HStack>
        </Stack>
      </Container>
    </Box>
  );
}
