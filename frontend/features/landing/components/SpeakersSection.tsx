import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextImage from "next/image";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/shared/components/AnimatedSection";

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
      py={{ base: 16, md: 24 }}
      bg="linear-gradient(180deg, #020414 0%, #050719 48%, #020414 100%)"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="-120px"
        left="-120px"
        w="480px"
        h="480px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(124,60,255,0.12) 0%, transparent 70%)"
        pointerEvents="none"
      />

      <Container maxW="8xl" px={{ base: 4, md: 6 }} position="relative" zIndex={1}>
        <AnimatedSection direction="up" delay={0} duration={0.6}>
          <Stack gap={4} align="center" textAlign="center" mb={14}>
          <Text
            color="brand.violet"
            fontSize="sm"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.15em"
          >
            Ponentes confirmados
          </Text>

          <Heading color="white" fontSize={{ base: "3xl", md: "5xl" }} lineHeight="1.1">
            Mentes que construyen el futuro
          </Heading>
        </Stack>
        </AnimatedSection>

        <AnimatedSection direction="up" delay={0} duration={0.6}>
          <StaggerContainer>
            <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} gap={6}>
              {SPEAKERS.map((speaker) => (
                <StaggerItem key={speaker.name}>
                  <Stack
                    align="center"
                    textAlign="center"
                    gap={4}
                    p={5}
                    borderRadius="xl"
                    className="glass-card"
                    transition="all 0.25s ease"
                    _hover={{
                      transform: "translateY(-6px)",
                      borderColor: "brand.cyan",
                    }}
                  >
                    <Box
                      position="relative"
                      w={{ base: "110px", md: "136px" }}
                      aspectRatio={1}
                      borderRadius="full"
                      overflow="hidden"
                      borderWidth="2px"
                      borderColor="brand.pink"
                      boxShadow="0 0 24px rgba(255,15,123,0.32)"
                      transition="all 0.25s ease"
                      _hover={{
                        boxShadow: "0 0 36px rgba(0,229,255,0.42)",
                        borderColor: "brand.cyan",
                      }}
                    >
                      <NextImage
                        src={speaker.image}
                        alt={speaker.name}
                        fill
                        style={{ objectFit: "cover" }}
                        className="transition-transform duration-300 hover:scale-110"
                      />
                    </Box>

                    <Text color="white" fontWeight="black" fontSize="md">
                      {speaker.name}
                    </Text>

                    <Text color="brand.muted" fontSize="xs" lineHeight="1.6">
                      {speaker.role}
                    </Text>
                  </Stack>
                </StaggerItem>
              ))}
            </SimpleGrid>
          </StaggerContainer>
        </AnimatedSection>
      </Container>
    </Box>
  );
}
