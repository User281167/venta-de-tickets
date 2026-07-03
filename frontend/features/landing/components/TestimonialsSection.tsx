"use client";

import { Box, Container, Grid, Heading, Stack, Text } from "@chakra-ui/react";
import { IconQuote, IconUsers, IconWorld } from "@tabler/icons-react";

const TESTIMONIALS = [
  { icon: IconQuote, quote: "Volver a la U con esta energia cambia la forma de imaginar el futuro.", author: "Egresada UTP" },
  { icon: IconUsers, quote: "El networking conecto generaciones, empresas y proyectos reales.", author: "Participante 2025" },
  { icon: IconWorld, quote: "Una convencion con mirada global y raiz universitaria.", author: "Aliado institucional" },
];

export function TestimonialsSection() {
  return (
    <Box py={{ base: 14, md: 20 }} bg="#020414">
      <Container maxW="1200px" px={{ base: 4, md: 6 }}>
        <Stack gap={3} align="center" textAlign="center" mb={10}>
          <Text color="brand.muted" fontSize="xs" fontWeight="black" textTransform="uppercase">Voces de la comunidad</Text>
          <Heading color="white" fontSize={{ base: "3xl", md: "4xl" }}>Historias que vuelven a encontrarse</Heading>
        </Stack>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
          {TESTIMONIALS.map((item, index) => {
            const TestimonialIcon = item.icon;
            return (
              <Stack key={item.author} gap={4} p={6} bg="rgba(255,255,255,0.035)" borderWidth="1px" borderColor="rgba(255,255,255,0.08)" borderRadius="8px">
                <TestimonialIcon size={36} color={index % 2 === 0 ? "#ff0f7b" : "#00e5ff"} />
                <Text color="brand.light" lineHeight="1.8">&ldquo;{item.quote}&rdquo;</Text>
                <Text color="brand.muted" fontSize="sm" fontWeight="bold">{item.author}</Text>
              </Stack>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
