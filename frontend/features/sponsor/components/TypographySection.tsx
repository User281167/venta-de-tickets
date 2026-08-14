"use client";

import {
  Box,
  Container,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";

const SAMPLES_HEADING = [
  "FUTURO",
  "Asociación de Egresados UTP",
  "EGRESADOS UTP 2026",
];
const SAMPLES_BODY = [
  "La U del futuro funciona como cierre emocional, visual y sonoro de la marca.",
  "Portadas, cierres, invitaciones, videos, banners, cuñas radiales y menciones institucionales.",
  "Logo o nombre del evento primero. Slogan después, como remate final de comunicación.",
];

export function TypographySection() {
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
              Sistema tipográfico
            </Text>
            <Heading
              as="h2"
              textStyle="sectionTitle"
              style={{ textWrap: "balance" }}
            >
              Dos familias, una voz
            </Heading>
            <Text
              color="utp.artico"
              opacity={0.75}
              fontSize={{ base: "md", md: "lg" }}
            >
              Títulos, fechas y rótulos de escenario en Good Times. Subtítulos,
              entradillas, etiquetas y bloques de información prioritaria en
              Montserrat Alternates.
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <Stack
              gap={5}
              p={{ base: 6, md: 8 }}
              rounded="2xl"
              borderWidth="1px"
              borderColor="whiteAlpha.100"
              bg="whiteAlpha.50"
            >
              <HStack
                gap={2}
                px={3}
                py={1}
                rounded="full"
                bg="utp.azul"
                color="utp.noche"
                alignSelf="flex-start"
              >
                <Text textStyle="eyebrow">Títulos</Text>
              </HStack>
              <Stack gap={2}>
                {SAMPLES_HEADING.map((s) => (
                  <Text
                    key={s}
                    fontFamily="heading"
                    fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
                    textTransform="uppercase"
                    lineHeight="1"
                    letterSpacing="-0.01em"
                  >
                    {s}
                  </Text>
                ))}
              </Stack>
              <Text fontFamily="body" fontSize="sm" opacity={0.6}>
                Good Times · 400/700 · uso en hero, escenario, rótulos.
              </Text>
            </Stack>

            <Stack
              gap={5}
              p={{ base: 6, md: 8 }}
              rounded="2xl"
              borderWidth="1px"
              borderColor="whiteAlpha.100"
              bg="whiteAlpha.50"
            >
              <HStack
                gap={2}
                px={3}
                py={1}
                rounded="full"
                bg="utp.magenta"
                color="utp.artico"
                alignSelf="flex-start"
              >
                <Text textStyle="eyebrow">Lectura</Text>
              </HStack>
              <Stack gap={3}>
                {SAMPLES_BODY.map((s) => (
                  <Text
                    key={s}
                    fontFamily="body"
                    fontSize={{ base: "md", md: "lg" }}
                    lineHeight="1.65"
                    opacity={0.85}
                  >
                    {s}
                  </Text>
                ))}
              </Stack>
              <Text fontFamily="body" fontSize="sm" opacity={0.6}>
                Montserrat Alternates · 400–900 · uso en subtítulos, etiquetas y
                bloques.
              </Text>
            </Stack>
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}
