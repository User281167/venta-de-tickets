"use client";

import { Box, Container, Flex, Grid, Heading, Icon, Stack, Text } from "@chakra-ui/react";
import { IconAward, IconCertificate, IconGift, IconHeartHandshake, IconPresentation } from "@tabler/icons-react";

const BENEFITS = [
  { icon: IconPresentation, title: "Acceso a conferencias exclusivas", desc: "Charlas con líderes globales de tecnología, emprendimiento e innovación." },
  { icon: IconCertificate, title: "Certificado de participación universitario", desc: "Recibe un certificado digital que avala tu participación en el evento." },
  { icon: IconHeartHandshake, title: "Networking con estudiantes y profesionales", desc: "Conéctate con reclutadores, mentores y otros estudiantes apasionados." },
  { icon: IconAward, title: "Acceso a material exclusivo post-evento", desc: "Llévate contenido digital, grabaciones y recursos preparados por los speakers." },
  { icon: IconGift, title: "Participación en sorteos de mentorías y becas", desc: "Gana mentorías personalizadas y becas para cursos y programas especializados." },
];

export function BenefitsSection() {
  return (
    <Box py={20} bg="gray.50">
      <Container maxW="1200px" px={4}>
        <Stack gap={3} align="center" mb={12}>
          <Heading as="h2" size={{ base: "2xl", md: "3xl" }} color="brand.dark" textAlign="center">
            ¿Por qué asistir?
          </Heading>
          <Text color="gray.600" textAlign="center" maxW="lg">
            Más que un evento, una experiencia que transforma tu perspectiva profesional
          </Text>
        </Stack>

        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" }} gap={6}>
          {BENEFITS.map((benefit) => (
            <Flex
              key={benefit.title}
              direction="column"
              p={6}
              bg="white"
              borderRadius="xl"
              borderWidth={1}
              borderColor="gray.100"
              boxShadow="sm"
              _hover={{ transform: "translateY(-4px)", boxShadow: "md" }}
              transition="all 0.2s"
            >
              <Flex w={12} h={12} bg="brand.teal" borderRadius="lg" align="center" justify="center" mb={4}>
                <Icon as={benefit.icon} boxSize={6} color="white" />
              </Flex>
              <Heading as="h3" size="sm" color="brand.dark" mb={2}>
                {benefit.title}
              </Heading>
              <Text fontSize="sm" color="gray.600">
                {benefit.desc}
              </Text>
            </Flex>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
