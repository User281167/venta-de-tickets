"use client";

import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Icon,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  IconAward,
  IconCertificate,
  IconGift,
  IconHeartHandshake,
  IconPresentation,
} from "@tabler/icons-react";

const BENEFITS = [
  {
    icon: IconPresentation,
    title: "Acceso a conferencias exclusivas",
    desc: "Charlas con líderes globales de tecnología, emprendimiento e innovación.",
  },
  {
    icon: IconCertificate,
    title: "Certificado de participación universitario",
    desc: "Recibe un certificado digital que avala tu participación en el evento.",
  },
  {
    icon: IconHeartHandshake,
    title: "Networking con estudiantes y profesionales",
    desc: "Conéctate con reclutadores, mentores y otros estudiantes apasionados.",
  },
  {
    icon: IconAward,
    title: "Acceso a material exclusivo post-evento",
    desc: "Llévate contenido digital, grabaciones y recursos preparados por los speakers.",
  },
  {
    icon: IconGift,
    title: "Participación en sorteos de mentorías y becas",
    desc: "Gana mentorías personalizadas y becas para cursos y programas especializados.",
  },
];

const STATS = [
  { value: "500+", label: "Asistentes" },
  { value: "15+", label: "Speakers" },
  { value: "8 horas", label: "Contenido" },
  { value: "3", label: "Tracks" },
];

export function BenefitsSection() {
  return (
    <Box
      py={20}
      position="relative"
      bgImage="url(/campus.jpg)"
      bgSize="cover"
      bgPosition="center"
      bgAttachment="fixed"
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        bg: "rgba(48, 56, 65, 0.85)",
      }}
    >
      <Container maxW="1200px" px={4} position="relative" zIndex={1}>
        <Stack gap={3} align="center" mb={12}>
          <Heading
            as="h2"
            size={{ base: "2xl", md: "3xl" }}
            color="white"
            textAlign="center"
          >
            ¿Por qué asistir?
          </Heading>
          <Text color="gray.300" textAlign="center" maxW="lg">
            Más que un evento, una experiencia que transforma tu perspectiva
            profesional
          </Text>
        </Stack>

        <Grid
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
          gap={5}
          mb={12}
        >
          {BENEFITS.map((benefit) => (
            <Flex
              key={benefit.title}
              direction="column"
              p={6}
              bg="rgba(255,255,255,0.08)"
              backdropFilter="blur(12px)"
              borderRadius="xl"
              borderWidth={1}
              borderColor="rgba(255,255,255,0.12)"
              _hover={{
                bg: "rgba(255,255,255,0.14)",
                transform: "translateY(-4px)",
              }}
              transition="all 0.2s"
            >
              <Flex align="center" spaceX="2">
                <Flex
                  w={12}
                  h={12}
                  bg="brand.teal"
                  borderRadius="lg"
                  align="center"
                  justify="center"
                  mb={4}
                >
                  <Icon as={benefit.icon} boxSize={6} color="white" />
                </Flex>
                <Heading as="h3" size="sm" color="white" mb={2}>
                  {benefit.title}
                </Heading>
              </Flex>
              <Text fontSize="sm" color="gray.300">
                {benefit.desc}
              </Text>
            </Flex>
          ))}
        </Grid>

        <Flex justify="center" wrap="wrap" gap={8}>
          {STATS.map((stat) => (
            <Stack key={stat.label} align="center" gap={0}>
              <Text fontSize="3xl" fontWeight="bold" color="brand.teal">
                {stat.value}
              </Text>
              <Text fontSize="sm" color="gray.400">
                {stat.label}
              </Text>
            </Stack>
          ))}
        </Flex>
      </Container>
    </Box>
  );
}
