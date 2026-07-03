"use client";

import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextImage from "next/image";

const SPEAKERS = [
  {
    name: "Santiago Bilinkis",
    role: "Futurista e investigador en inteligencia artificial.",
    image: "/carlos.jpg",
  },
  {
    name: "Carolina Cruz",
    role: "Líder en innovación y transformación organizacional.",
    image: "/laura.jpg",
  },
  {
    name: "Daniel Gomez",
    role: "Emprendedor serial y mentor de startups tecnológicas.",
    image: "/andres.jpg",
  },
  {
    name: "Maria Camila Díaz",
    role: "Experta en liderazgo consciente y desarrollo humano.",
    image: "/elena.jpg",
  },
  {
    name: "Invitado Internacional",
    role: "Próximamente más información",
    image: "/conferencia-2.jpg",
  },
];

export function SpeakersSection() {
  return (
    <Box
      id="speakers"
      py={{ base: 14, md: 20 }}
      bg="linear-gradient(180deg, #020414 0%, #050719 48%, #020414 100%)"
    >
      <Container maxW="8xl" px={{ base: 4, md: 6 }}>
        <Stack gap={3} align="center" textAlign="center" mb={10}>
          <Text
            color="brand.muted"
            fontSize="md"
            fontWeight="light"
            textTransform="uppercase"
          >
            Ponentes confirmados
          </Text>

          <Heading color="white" fontSize={{ base: "3xl", md: "4xl" }}>
            Mentes que están construyendo el futuro
          </Heading>
        </Stack>

        <SimpleGrid columns={{ base: 2, md: 5 }} gap={6}>
          {SPEAKERS.map((speaker) => (
            <Stack
              key={speaker.name}
              align="center"
              textAlign="center"
              gap={3}
              borderLeftWidth={{ base: 0, md: "1px" }}
              borderColor="rgba(255,255,255,0.12)"
            >
              <Box
                position="relative"
                w={{ base: "104px", md: "128px" }}
                aspectRatio={1}
                borderRadius="full"
                overflow="hidden"
                borderWidth="2px"
                borderColor="brand.pink"
                boxShadow="0 0 24px rgba(255,15,123,0.32)"
              >
                <NextImage
                  src={speaker.image}
                  alt={speaker.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </Box>

              <Text color="white" fontWeight="black">
                {speaker.name}
              </Text>

              <Text color="brand.muted" fontSize="xs">
                {speaker.role}
              </Text>
            </Stack>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
