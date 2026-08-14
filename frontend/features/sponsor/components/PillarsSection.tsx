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
import { IconHeart, IconRocket, IconStars } from "@tabler/icons-react";

type Pillar = {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
  accent: string;
};

const PILLARS: Pillar[] = [
  {
    title: "Pertenencia",
    description:
      "La Asociación de Egresados habla desde la comunidad UTP: egresados, estudiantes, docentes, aliados y ciudad.",
    icon: IconHeart,
    accent: "utp.magenta",
  },
  {
    title: "Futuro aplicado",
    description:
      "La IA aparece como herramienta de transformación académica, profesional y social.",
    icon: IconRocket,
    accent: "utp.azul",
  },
  {
    title: "Celebración útil",
    description:
      "El sistema sirve para agenda, escenario, piezas digitales, señalética y networking.",
    icon: IconStars,
    accent: "utp.naranja",
  },
];

export function PillarsSection() {
  return (
    <Box
      as="section"
      id="pilares"
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
              Sistema de marca
            </Text>
            <Heading
              as="h2"
              textStyle="sectionTitle"
              style={{ textWrap: "balance" }}
            >
              Una identidad que reúne generaciones
            </Heading>
            <Text
              color="utp.artico"
              opacity={0.75}
              fontSize={{ base: "md", md: "lg" }}
            >
              Tres principios guían cada aplicación visual. La marca debe
              expresar pertenencia, futuro y celebración, sin perder cercanía
              institucional.
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Stack
                  key={pillar.title}
                  gap={4}
                  p={{ base: 6, md: 8 }}
                  rounded="2xl"
                  borderWidth="1px"
                  borderColor="whiteAlpha.100"
                  bg="whiteAlpha.50"
                  _hover={{
                    borderColor: pillar.accent,
                    transform: "translateY(-4px)",
                  }}
                  transition="all 0.25s"
                >
                  <HStack
                    justify="center"
                    align="center"
                    w="56px"
                    h="56px"
                    rounded="xl"
                    bg={pillar.accent}
                    color="utp.noche"
                  >
                    <Icon size={26} />
                  </HStack>
                  <Heading
                    as="h3"
                    fontFamily="heading"
                    fontSize={{ base: "xl", md: "2xl" }}
                    textTransform="uppercase"
                    letterSpacing="0.02em"
                  >
                    {pillar.title}
                  </Heading>
                  <Text color="utp.artico" opacity={0.78} lineHeight="1.6">
                    {pillar.description}
                  </Text>
                </Stack>
              );
            })}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}
