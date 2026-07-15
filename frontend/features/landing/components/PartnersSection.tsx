"use client";

import { Box, Container, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import {
  IconBuildingBank,
  IconChartBar,
  IconCpu,
  IconDeviceLaptop,
  IconLeaf,
  IconRocket,
  IconSchool,
  IconTruck,
} from "@tabler/icons-react";
import { AnimatedSection } from "@/shared/components/AnimatedSection";

const PARTNERS = [
  { name: "UTP Innova", icon: IconRocket },
  { name: "TechEje", icon: IconCpu },
  { name: "Banco del Futuro", icon: IconBuildingBank },
  { name: "Ecosistema Verde", icon: IconLeaf },
  { name: "Logística Plus", icon: IconTruck },
  { name: "EdTech Colombia", icon: IconDeviceLaptop },
  { name: "DataLab", icon: IconChartBar },
  { name: "Universitas", icon: IconSchool },
];

export function PartnersSection() {
  const track = [...PARTNERS, ...PARTNERS];

  return (
    <Box
      id="aliados"
      py={{ base: 16, md: 24 }}
      bg="linear-gradient(180deg, #020414 0%, #050719 48%, #020414 100%)"
      position="relative"
      overflow="hidden"
    >
      <Container maxW="8xl" px={{ base: 4, md: 6 }}>
        <AnimatedSection direction="up" delay={0} duration={0.6}>
          <Stack gap={4} align="center" textAlign="center" mb={14}>
          <Text
            color="brand.pink"
            fontSize="sm"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.15em"
          >
            Aliados estratégicos
          </Text>

          <Heading color="white" fontSize={{ base: "3xl", md: "5xl" }} lineHeight="1.1">
            Quienes hacen posible este encuentro
          </Heading>
        </Stack>
        </AnimatedSection>
      </Container>

      <Box
        position="relative"
        w="full"
        _before={{
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          w: { base: "60px", md: "120px" },
          bg: "linear-gradient(90deg, #020414, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
        _after={{
          content: '""',
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          w: { base: "60px", md: "120px" },
          bg: "linear-gradient(270deg, #020414, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        <Box
          display="flex"
          w="max-content"
          className="animate-marquee"
          _hover={{ animationPlayState: "paused" }}
        >
          {track.map((partner, index) => {
            const PartnerIcon = partner.icon;
            return (
              <HStack
                key={`${partner.name}-${index}`}
                gap={4}
                px={{ base: 6, md: 10 }}
                py={5}
                mx={3}
                minW={{ base: "240px", md: "300px" }}
                borderRadius="xl"
                className="glass-card"
                transition="all 0.25s ease"
                _hover={{
                  borderColor: "brand.cyan",
                  transform: "scale(1.03)",
                  boxShadow: "0 0 28px rgba(0,229,255,0.16)",
                }}
              >
                <Box
                  p={3}
                  borderRadius="xl"
                  bg="rgba(0,229,255,0.1)"
                >
                  <PartnerIcon size={32} color="#00e5ff" />
                </Box>
                <Text color="white" fontWeight="bold" fontSize={{ base: "md", md: "lg" }} whiteSpace="nowrap">
                  {partner.name}
                </Text>
              </HStack>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
