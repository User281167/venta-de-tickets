"use client";

import { Box, Container, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";

type Swatch = {
  name: string;
  hex: string;
  cmyk: string;
  usage: string;
  token: string;
  textColor?: string;
};

const SWATCHES: Swatch[] = [
  {
    name: "Azul noche",
    hex: "#0F1226",
    cmyk: "61 · 53 · 0 · 85",
    usage: "Fondo maestro",
    token: "utp.noche",
  },
  {
    name: "Blanco ártico",
    hex: "#F0F4F5",
    cmyk: "2 · 0 · 0 · 4",
    usage: "Base neutra",
    token: "utp.artico",
    textColor: "utp.noche",
  },
  {
    name: "Azul",
    hex: "#00C2FF",
    cmyk: "100 · 24 · 0 · 0",
    usage: "Académico, innovación, datos, conferencias",
    token: "utp.azul",
  },
  {
    name: "Naranja",
    hex: "#E94E1B",
    cmyk: "0 · 67 · 88 · 9",
    usage: "Networking, empleabilidad, emprendimiento",
    token: "utp.naranja",
  },
  {
    name: "Magenta",
    hex: "#A01060",
    cmyk: "0 · 90 · 40 · 37",
    usage: "Cultural, fiesta, concierto, celebración",
    token: "utp.magenta",
  },
  {
    name: "Verde",
    hex: "#39FF63",
    cmyk: "78 · 0 · 57 · 0",
    usage: "Deporte, salud, bienestar, comunidad",
    token: "utp.verde",
    textColor: "utp.noche",
  },
];

export function PaletteSection() {
  return (
    <Box
      as="section"
      bg="utp.noche"
      color="utp.artico"
      py={{ base: 16, md: 24 }}
      borderBottomWidth="1px"
      borderColor="whiteAlpha.100"
    >
      <Container maxW="7xl">
        <Stack gap={{ base: 10, md: 14 }}>
          <Stack gap={3} maxW="3xl">
            <Text textStyle="eyebrow" color="utp.azul">
              Paleta cromática
            </Text>
            <Heading as="h2" textStyle="sectionTitle" style={{ textWrap: "balance" }}>
              Color institucional y codificación por actividad
            </Heading>
            <Text color="utp.artico" opacity={0.75} fontSize={{ base: "md", md: "lg" }}>
              El fondo maestro es Azul noche, la base neutra Blanco ártico. Las
              cuatro acentúan los ejes temáticos del evento.
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={5}>
            {SWATCHES.map((s) => (
              <Stack
                key={s.token}
                gap={0}
                rounded="2xl"
                overflow="hidden"
                borderWidth="1px"
                borderColor="whiteAlpha.100"
              >
                <Box bg={s.token} h="160px" />
                <Stack gap={1} p={5} bg="whiteAlpha.50">
                  <Text
                    fontFamily="heading"
                    fontSize="lg"
                    color="utp.artico"
                    textTransform="uppercase"
                    letterSpacing="0.04em"
                  >
                    {s.name}
                  </Text>
                  <Text fontFamily="body" fontSize="sm" color="utp.artico" opacity={0.8}>
                    {s.hex} · CMYK {s.cmyk}
                  </Text>
                  <Text
                    fontFamily="body"
                    fontSize="sm"
                    color="utp.artico"
                    opacity={0.65}
                    pt={2}
                  >
                    {s.usage}
                  </Text>
                </Stack>
              </Stack>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}
