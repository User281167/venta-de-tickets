"use client";

import { Box, Container, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import Image from "next/image";

type LogoVariant = {
  src: string;
  label: string;
  bg: string;
  textColor: string;
};

const VARIANTS: LogoVariant[] = [
  {
    src: "/assets/logos-la-u/Vertical - letras azules.png",
    label: "Vertical · fondo claro",
    bg: "utp.artico",
    textColor: "utp.noche",
  },
  {
    src: "/assets/logos-la-u/Vertical - letras blancas.png",
    label: "Vertical · fondo oscuro",
    bg: "utp.noche",
    textColor: "utp.artico",
  },
  {
    src: "/assets/logos-la-u/Horizontal - letras azules.png",
    label: "Horizontal · encabezados",
    bg: "utp.artico",
    textColor: "utp.noche",
  },
  {
    src: "/assets/logos-la-u/Horizontal - letras blancas.png",
    label: "Horizontal · escenario",
    bg: "utp.noche",
    textColor: "utp.artico",
  },
];

export function LogoSection() {
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
              Logo maestro
            </Text>
            <Heading as="h2" textStyle="sectionTitle" style={{ textWrap: "balance" }}>
              Versión vertical prioritaria
            </Heading>
            <Text color="utp.artico" opacity={0.75} fontSize={{ base: "md", md: "lg" }}>
              Firma principal para piezas de alto impacto: portada, invitaciones,
              fondos de escenario, publicaciones de lanzamiento y comunicaciones
              institucionales generales. La zona de seguridad equivale a 2× la
              altura de la palabra FUTURO.
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={5}>
            {VARIANTS.map((v) => (
              <Stack key={v.src} gap={3}>
                <Box
                  rounded="2xl"
                  overflow="hidden"
                  borderWidth="1px"
                  borderColor="whiteAlpha.100"
                  bg={v.bg}
                  p={{ base: 6, md: 8 }}
                  minH="220px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Box position="relative" w="100%" h="160px">
                    <Image
                      src={v.src}
                      alt={v.label}
                      fill
                      sizes="(min-width: 1024px) 240px, (min-width: 640px) 50vw, 100vw"
                      style={{ objectFit: "contain" }}
                    />
                  </Box>
                </Box>
                <Text
                  fontFamily="body"
                  fontSize="sm"
                  color="utp.artico"
                  opacity={0.7}
                  textAlign="center"
                >
                  {v.label}
                </Text>
              </Stack>
            ))}
          </SimpleGrid>

          <Stack
            gap={3}
            p={{ base: 5, md: 6 }}
            rounded="2xl"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
            bg="whiteAlpha.50"
          >
            <Text
              fontFamily="heading"
              fontSize="lg"
              textTransform="uppercase"
              letterSpacing="0.04em"
              color="utp.azul"
            >
              Usos incorrectos
            </Text>
            <Text fontFamily="body" color="utp.artico" opacity={0.75} lineHeight="1.6">
              No deformar, no recolorear, no añadir sombras, no encerrar en
              cajas, no usar bajo contraste, no rotar, no separar símbolo y
              texto, no aplicar efectos 3D.
            </Text>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
