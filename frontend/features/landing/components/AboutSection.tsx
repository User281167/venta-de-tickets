"use client";

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
      py={{ base: 14, md: 20 }}
      bg="linear-gradient(180deg, #020414 0%, #050719 48%, #020414 100%)"
      borderTopWidth="1px"
      borderColor="rgba(255,255,255,0.07)"
    >
      <Container maxW="8xl" px={{ base: 4, md: 6 }}>
        <Grid
          templateColumns={{ base: "1fr", lg: "0.9fr 1.1fr" }}
          gap={{ base: 10, lg: 16 }}
          alignItems="center"
        >
          <Stack gap={4}>
            <Text
              textTransform="uppercase"
              backgroundImage="linear-gradient(90deg, var(--chakra-colors-brand-violet), var(--chakra-colors-brand-pink), var(--chakra-colors-brand-violet))"
              backgroundClip="text"
              color="transparent"
              fontSize="2xl"
            >
              La convención
            </Text>

            <Heading
              color="white"
              fontSize={{ base: "2xl", md: "4xl" }}
              lineHeight="1.08"
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
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 2, md: 4 }} gap={5}>
            {IMPACT.map((item) => {
              const ImpactIcon = item.icon;
              return (
                <Stack
                  key={item.value}
                  align="center"
                  textAlign="center"
                  gap={3}
                  p={5}
                  borderLeftWidth={{ base: 0, md: "1px" }}
                  borderColor="rgba(255,255,255,0.12)"
                >
                  <ImpactIcon
                    size={48}
                    stroke={1}
                    color={item.value === "+4.000" ? "#ff0f7b" : "#00e5ff"}
                  />

                  <Text color="white" fontSize="lg" fontWeight="bold">
                    {item.value}
                  </Text>

                  <Text color="brand.muted" fontSize="sm">
                    {item.label}
                  </Text>
                </Stack>
              );
            })}
          </SimpleGrid>
        </Grid>
      </Container>
    </Box>
  );
}
