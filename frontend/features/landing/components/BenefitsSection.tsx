import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  IconArrowRight,
  IconBriefcase,
  IconHeart,
  IconMicrophone,
  IconSchool,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import NextLink from "next/link";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/shared/components/AnimatedSection";

const ACTIVITIES = [
  {
    icon: IconMicrophone,
    title: "Conferencias",
    text: "Líderes nacionales e internacionales en IA, innovación y transformación digital.",
  },
  {
    icon: IconSchool,
    title: "Talleres",
    text: "Aprende, actualiza y potencia tus habilidades del futuro con expertos.",
  },
  {
    icon: IconUsers,
    title: "Networking",
    text: "Conecta con egresados, empresas e instituciones que transforman el mundo.",
  },
  {
    icon: IconBriefcase,
    title: "Feria de Empleo",
    text: "Oportunidades laborales, ruedas de negocio y vitrina de emprendimientos.",
  },
  {
    icon: IconSparkles,
    title: "Cultura",
    text: "Conciertos, arte, deportes y actividades para disfrutar y reconectar.",
  },
  {
    icon: IconHeart,
    title: "Reencuentro",
    text: "Revive momentos, comparte historias y fortalece el sentido de pertenencia.",
  },
];

export function BenefitsSection() {
  return (
    <Box id="actividades" py={{ base: 16, md: 24 }} bg="#020414" position="relative" overflow="hidden">
      <Box
        position="absolute"
        bottom="-160px"
        right="-160px"
        w="500px"
        h="500px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 70%)"
        pointerEvents="none"
      />

      <Container maxW="8xl" px={{ base: 4, md: 6 }} position="relative" zIndex={1}>
        <AnimatedSection direction="up" delay={0} duration={0.6}>
          <Stack gap={4} align="center" textAlign="center" mb={14}>
          <Text
            color="brand.cyan"
            fontSize="sm"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.15em"
          >
            ¿Qué vas a vivir?
          </Text>

          <Heading color="white" fontSize={{ base: "3xl", md: "5xl" }} lineHeight="1.1">
            Una agenda para inspirarte
          </Heading>

          <Text color="brand.muted" fontSize={{ base: "md", md: "lg" }} maxW="700px">
            Seis experiencias diseñadas para conectar el talento UTP con las oportunidades del futuro.
          </Text>
        </Stack>
        </AnimatedSection>

        <AnimatedSection direction="up" delay={0} duration={0.6}>
          <StaggerContainer>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={6}>
              {ACTIVITIES.map((activity, index) => {
                const ActivityIcon = activity.icon;
                return (
                  <StaggerItem key={activity.title}>
                    <Stack
                      align="flex-start"
                      gap={4}
                      p={6}
                      borderRadius="xl"
                      className="glass-card"
                      transition="all 0.25s ease"
                      _hover={{
                        transform: "translateY(-6px)",
                        borderColor: index % 2 === 0 ? "brand.pink" : "brand.cyan",
                        boxShadow:
                          index % 2 === 0
                            ? "0 0 28px rgba(255,15,123,0.18)"
                            : "0 0 28px rgba(0,229,255,0.18)",
                      }}
                    >
                      <Box
                        p={3}
                        borderRadius="xl"
                        bg={
                          index % 2 === 0
                            ? "rgba(255,15,123,0.12)"
                            : "rgba(0,229,255,0.12)"
                        }
                      >
                        <ActivityIcon
                          size={36}
                          stroke={1.5}
                          color={index % 2 === 0 ? "#ff0f7b" : "#00e5ff"}
                        />
                      </Box>

                      <Text color="white" fontWeight="bold" fontSize="xl">
                        {activity.title}
                      </Text>

                      <Text color="brand.muted" fontSize="sm" lineHeight="1.7">
                        {activity.text}
                      </Text>
                    </Stack>
                  </StaggerItem>
                );
              })}
            </SimpleGrid>
          </StaggerContainer>
        </AnimatedSection>

        <Center mt={14}>
          <Button
            asChild
            size={{ base: "md", md: "lg" }}
            w="full"
            maxW="xl"
            minH="56px"
            border="2px solid transparent"
            bg={`
              linear-gradient(#020414, #020414) padding-box,
              linear-gradient(90deg, #ff0f7b, #00e5ff) border-box
            `}
            transition="all 0.25s ease"
            _hover={{
              borderColor: "brand.pink",
              transform: "translateY(-2px)",
              boxShadow: "0 0 42px rgba(0,229,255,0.42)",
            }}
            color="white"
          >
            <NextLink href="/agenda">
              VER AGENDA COMPLETA <IconArrowRight size={22} />
            </NextLink>
          </Button>
        </Center>
      </Container>
    </Box>
  );
}
