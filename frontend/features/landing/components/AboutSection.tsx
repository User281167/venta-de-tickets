import {
  Box,
  Container,
  Grid,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  IconRocket,
  IconSparkles,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react";
import NextImage from "next/image";
import { AnimatedSection } from "@/shared/components/AnimatedSection";

const IMPACT = [
  { icon: IconUsers, value: "+4.000", label: "Egresados reunidos" },
  {
    icon: IconRocket,
    value: "+30",
    label: "Actividades académicas y culturales",
  },
  {
    icon: IconSparkles,
    value: "Innovación",
    label: "e inteligencia colectiva",
  },
  { icon: IconWorld, value: "Impacto", label: "para el presente y el futuro" },
];

export function AboutSection() {
  return (
    <Box
      id="convencion"
      py={{ base: 16, md: 24 }}
      bg="linear-gradient(180deg, #020414 0%, #050719 48%, #020414 100%)"
      borderTopWidth="1px"
      borderColor="rgba(255,255,255,0.07)"
      position="relative"
      overflow="hidden"
    >
      <Container maxW="8xl" px={{ base: 4, md: 6 }}>
        <AnimatedSection direction="up" delay={0} duration={0.6}>
          <Grid
            templateColumns={{ base: "1fr", lg: "1.1fr 0.9fr" }}
            gap={{ base: 12, lg: 16 }}
            alignItems="center"
          >
          <Box
            position="relative"
            borderRadius="2xl"
            overflow="hidden"
            h={{ base: "320px", md: "480px" }}
          >
            <NextImage
              src="/conferencia-1.jpg"
              alt="Auditorio de la Universidad Tecnológica de Pereira"
              fill
              style={{ objectFit: "cover" }}
            />
            <Box
              position="absolute"
              inset={0}
              bg="linear-gradient(180deg, transparent 40%, rgba(2,4,20,0.8) 100%)"
            />
            <Box
              position="absolute"
              bottom={6}
              left={6}
              right={6}
              p={4}
              borderRadius="xl"
              className="glass-card"
            >
              <Text color="white" fontWeight="bold" fontSize="lg">
                Tres días de inspiración
              </Text>
              <Text color="brand.muted" fontSize="sm">
                Pereira, Colombia
              </Text>
            </Box>
          </Box>

          <Stack gap={6}>
            <Text
              textTransform="uppercase"
              backgroundImage="linear-gradient(90deg, var(--chakra-colors-brand-violet), var(--chakra-colors-brand-pink), var(--chakra-colors-brand-cyan))"
              backgroundClip="text"
              color="transparent"
              fontSize={{ base: "lg", md: "2xl" }}
              fontWeight="bold"
            >
              La convención
            </Text>

            <Heading
              color="white"
              fontSize={{ base: "2xl", md: "4xl" }}
              lineHeight="1.1"
            >
              Un encuentro que transforma generaciones
            </Heading>

            <Text
              color="brand.muted"
              fontSize={{ base: "md", md: "lg" }}
              lineHeight="1.8"
            >
              Tres días para reconectar, aprender, inspirarnos y aportar al
              desarrollo del país desde el corazón de nuestra Universidad.
              Expertos nacionales e internacionales, actividades académicas,
              culturales y espacios de networking en un solo lugar.
            </Text>

            <SimpleGrid columns={{ base: 2, md: 2 }} gap={4}>
              {IMPACT.map((item) => {
                const ImpactIcon = item.icon;
                return (
                  <Stack
                    key={item.value}
                    align="center"
                    textAlign="center"
                    gap={3}
                    p={5}
                    borderRadius="xl"
                    className="glass-card"
                    transition="all 0.25s ease"
                    _hover={{
                      transform: "translateY(-4px)",
                      borderColor: "brand.pink",
                      boxShadow: "0 0 24px rgba(255,15,123,0.16)",
                    }}
                  >
                    <ImpactIcon
                      size={44}
                      stroke={1}
                      color={item.value === "+4.000" ? "#ff0f7b" : "#00e5ff"}
                    />

                    <Text color="white" fontSize="xl" fontWeight="black">
                      {item.value}
                    </Text>

                    <Text color="brand.muted" fontSize="sm">
                      {item.label}
                    </Text>
                  </Stack>
                );
              })}
            </SimpleGrid>
          </Stack>
          </Grid>
        </AnimatedSection>
      </Container>
    </Box>
  );
}
