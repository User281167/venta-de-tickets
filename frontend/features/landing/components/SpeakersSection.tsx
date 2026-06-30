"use client";

import { Box, Container, Grid, Heading, Stack, Text } from "@chakra-ui/react";
import { IconBriefcase, IconMicrophone } from "@tabler/icons-react";
import NextImage from "next/image";

const SPEAKERS = [
  {
    name: "Dr. Elena Martínez",
    role: "IA & Ética Digital – MIT",
    topic: "El futuro de la inteligencia artificial responsable",
    image: "/elena.jpg",
  },
  {
    name: "Carlos Vega",
    role: "Founder & CEO – StartupX",
    topic: "De estudiante a fundador de una startup unicornio",
    image: "/carlos.jpg",
  },
  {
    name: "Laura Gómez",
    role: "Directora de Innovación – TechGlobal",
    topic: "Cómo innovan las grandes empresas desde dentro",
    image: "/laura.jpg",
  },
  {
    name: "Andrés Ruiz",
    role: "Especialista en futuro del trabajo – LinkedIn Insights",
    topic: "Las carreras que sobrevivirán al 2030",
    image: "/andres.jpg",
  },
];

export function SpeakersSection() {
  return (
    <Box id="speakers" py={20} bg="gray.50">
      <Container maxW="1200px" px={4}>
        <Stack gap={3} align="center" mb={12}>
          <Heading
            as="h2"
            size={{ base: "2xl", md: "3xl" }}
            color="brand.dark"
            textAlign="center"
          >
            Speakers invitados
          </Heading>
          <Text color="gray.600" textAlign="center" maxW="lg">
            Conoce a los expertos que compartirán su conocimiento y experiencia
            en Future Minds 2026
          </Text>
        </Stack>

        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
          {SPEAKERS.map((speaker) => (
            <Box
              key={speaker.name}
              position="relative"
              borderRadius="xl"
              overflow="hidden"
              boxShadow="md"
              _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
              transition="all 0.2s"
            >
              <Box position="relative" w="full" aspectRatio={2 / 3}>
                <NextImage
                  src={speaker.image}
                  alt={speaker.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </Box>

              <Stack
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                p={5}
                bg="linear-gradient(transparent 0%, rgba(0,0,0,1) 60%)"
                gap={1}
              >
                <Heading as="h3" size="lg" color="white">
                  {speaker.name}
                </Heading>
                <Stack gap={1}>
                  <Text fontSize="md" color="brand.teal" fontWeight="medium">
                    <IconBriefcase
                      size={16}
                      style={{ display: "inline", marginRight: 4 }}
                    />
                    {speaker.role}
                  </Text>
                  <Text fontSize="sm" color="gray.200">
                    <IconMicrophone
                      size={14}
                      style={{ display: "inline", marginRight: 4 }}
                    />
                    {speaker.topic}
                  </Text>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
