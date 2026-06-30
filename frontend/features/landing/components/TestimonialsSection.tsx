"use client";

import { Box, Container, Flex, Grid, Heading, Icon, Stack, Text } from "@chakra-ui/react";
import { IconQuote } from "@tabler/icons-react";

const TESTIMONIALS = [
  {
    quote: "Una experiencia que cambió mi forma de ver mi carrera.",
    author: "Estudiante de Ingeniería",
  },
  {
    quote: "El networking fue increíble, conocí a mi futuro socio.",
    author: "Participante edición 2025",
  },
  {
    quote: "Contenido real, aplicable y motivador.",
    author: "Alumna de Administración",
  },
];

export function TestimonialsSection() {
  return (
    <Box py={20} bg="gray.50">
      <Container maxW="1200px" px={4}>
        <Stack gap={3} align="center" mb={12}>
          <Heading as="h2" size={{ base: "2xl", md: "3xl" }} color="brand.dark" textAlign="center">
            Lo que dicen eventos anteriores
          </Heading>
        </Stack>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
          {TESTIMONIALS.map((t) => (
            <Flex key={t.author} direction="column" bg="white" p={6} borderRadius="xl" borderWidth={1} borderColor="gray.100" boxShadow="sm">
              <Icon as={IconQuote} boxSize={8} color="brand.teal" opacity={0.4} mb={3} />
              <Text fontSize="md" color="gray.600" lineHeight="1.7" fontStyle="italic" flex={1}>
                &ldquo;{t.quote}&rdquo;
              </Text>
              <Text fontSize="sm" fontWeight="bold" color="brand.dark" mt={4}>
                — {t.author}
              </Text>
            </Flex>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
