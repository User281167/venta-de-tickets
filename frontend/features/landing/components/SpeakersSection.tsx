"use client";

import { Box, Container, Flex, Grid, Heading, Icon, Stack, Text } from "@chakra-ui/react";
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
          <Heading as="h2" size={{ base: "2xl", md: "3xl" }} color="brand.dark" textAlign="center">
            Speakers invitados
          </Heading>
          <Text color="gray.600" textAlign="center" maxW="lg">
            Conoce a los expertos que compartirán su conocimiento y experiencia en Future Minds 2026
          </Text>
        </Stack>

        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }} gap={6}>
          {SPEAKERS.map((speaker) => (
            <Flex
              key={speaker.name}
              direction="column"
              align="center"
              bg="white"
              p={6}
              borderRadius="xl"
              borderWidth={1}
              borderColor="gray.100"
              boxShadow="sm"
              _hover={{ transform: "translateY(-4px)", boxShadow: "md" }}
              transition="all 0.2s"
            >
              <Box w={32} h={32} borderRadius="full">
                <NextImage
                  src={speaker.image}
                  alt={speaker.name}
                  width={128}
                  height={128}
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                />
              </Box>

              <Stack gap={1} align="center" mt={4}>
                <Heading as="h3" size="md" color="brand.dark" textAlign="center">
                  {speaker.name}
                </Heading>
                <Flex gap={1} align="center" color="brand.teal">
                  <Icon as={IconBriefcase} boxSize={4} />
                  <Text fontSize="sm" fontWeight="medium" textAlign="center">{speaker.role}</Text>
                </Flex>
                <Flex gap={1} align="center" color="gray.500" mt={1}>
                  <Icon as={IconMicrophone} boxSize={4} />
                  <Text fontSize="xs" textAlign="center">{speaker.topic}</Text>
                </Flex>
              </Stack>
            </Flex>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
