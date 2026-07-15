import { Box, Container, Grid, Heading, Stack, Text } from "@chakra-ui/react";
import { IconQuote, IconUsers, IconWorld } from "@tabler/icons-react";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/shared/components/AnimatedSection";

const TESTIMONIALS = [
  {
    icon: IconQuote,
    quote:
      "Volver a la U con esta energía cambia la forma de imaginar el futuro.",
    author: "Egresada UTP",
  },
  {
    icon: IconUsers,
    quote: "El networking conectó generaciones, empresas y proyectos reales.",
    author: "Participante 2025",
  },
  {
    icon: IconWorld,
    quote: "Una convención con mirada global y raíz universitaria.",
    author: "Aliado institucional",
  },
];

export function TestimonialsSection() {
  return (
    <Box py={{ base: 16, md: 24 }} bg="#020414" position="relative" overflow="hidden">
      <Box
        position="absolute"
        top="-100px"
        right="-100px"
        w="400px"
        h="400px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(255,15,123,0.08) 0%, transparent 70%)"
        pointerEvents="none"
      />

      <Container maxW="1200px" px={{ base: 4, md: 6 }} position="relative" zIndex={1}>
        <AnimatedSection direction="up" delay={0} duration={0.6}>
          <Stack gap={4} align="center" textAlign="center" mb={14}>
          <Text
            color="brand.cyan"
            fontSize="sm"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.15em"
          >
            Voces de la comunidad
          </Text>

          <Heading color="white" fontSize={{ base: "3xl", md: "5xl" }} lineHeight="1.1">
            Historias que vuelven a encontrarse
          </Heading>
        </Stack>
        </AnimatedSection>

        <AnimatedSection direction="up" delay={0} duration={0.6}>
          <StaggerContainer>
            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
              {TESTIMONIALS.map((item, index) => {
                const TestimonialIcon = item.icon;
                return (
                  <StaggerItem key={item.author}>
                    <Stack
                      gap={5}
                      p={6}
                      borderRadius="xl"
                      className="glass-card"
                      transition="all 0.25s ease"
                      _hover={{
                        transform: "translateY(-6px)",
                        borderColor: index % 2 === 0 ? "brand.pink" : "brand.cyan",
                      }}
                    >
                      <TestimonialIcon
                        size={40}
                        color={index % 2 === 0 ? "#ff0f7b" : "#00e5ff"}
                      />

                      <Text color="white" lineHeight="1.8" fontSize={{ base: "md", md: "lg" }}>
                        &ldquo;{item.quote}&rdquo;
                      </Text>

                      <Text color="brand.muted" fontSize="sm" fontWeight="bold">
                        — {item.author}
                      </Text>
                    </Stack>
                  </StaggerItem>
                );
              })}
            </Grid>
          </StaggerContainer>
        </AnimatedSection>
      </Container>
    </Box>
  );
}
