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

const ACTIVITIES = [
  {
    icon: IconMicrophone,
    title: "Conferencias y Ponencias",
    text: "Líderes nacionales e internacionales en IA, innovación y transformación digital.",
  },
  {
    icon: IconSchool,
    title: "Talleres y Masterclass",
    text: "Aprende, actualiza y potencia tus habilidades del futuro.",
  },
  {
    icon: IconUsers,
    title: "Networking",
    text: "Conecta con egresados, empresas e instituciones que están transformando el mundo.",
  },
  {
    icon: IconBriefcase,
    title: "Feria de Empleo",
    text: "Oportunidades laborales, ruedas de negocio y vitrina de emprendimientos.",
  },
  {
    icon: IconSparkles,
    title: "Experiencias y Cultura",
    text: "Conciertos, arte, deportes y actividades para disfrutar y reconectar.",
  },
  {
    icon: IconHeart,
    title: "Reencuentro UTP",
    text: "Revive momentos, comparte historias y fortalece el sentido de pertenencia.",
  },
];

export function BenefitsSection() {
  return (
    <Box id="actividades" py={{ base: 14, md: 20 }} bg="#020414">
      <Container maxW="8xl" px={{ base: 4, md: 6 }}>
        <Stack gap={3} align="center" textAlign="center" mb={12}>
          <Text color="brand.muted" fontSize="xl" textTransform="uppercase">
            ¿Qué vas a vivir?
          </Text>

          <Heading color="white" fontSize={{ base: "3xl", md: "4xl" }}>
            Una agenda para inspirarte y transformar
          </Heading>
        </Stack>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 6 }} gap={5}>
          {ACTIVITIES.map((activity, index) => {
            const ActivityIcon = activity.icon;
            return (
              <Stack
                key={activity.title}
                align="center"
                textAlign="center"
                gap={3}
                p={4}
                borderRightWidth={{
                  base: 0,
                  lg: index === ACTIVITIES.length - 1 ? 0 : "1px",
                }}
                borderColor="rgba(255,255,255,0.1)"
              >
                <ActivityIcon
                  size={64}
                  stroke={1}
                  color={index % 2 === 0 ? "#ff0f7b" : "#00e5ff"}
                />

                <Text color="white" fontWeight="bold" minH="48px">
                  {activity.title}
                </Text>

                <Text color="brand.muted" fontSize="xs" lineHeight="1.7">
                  {activity.text}
                </Text>
              </Stack>
            );
          })}
        </SimpleGrid>

        <Center mt={10}>
          <Button
            asChild
            size="xl"
            w="full"
            maxW="xl"
            border="2px solid transparent"
            bg={`
              linear-gradient(#020414, #020414) padding-box,
              linear-gradient(90deg, #ff0f7b, #00e5ff) border-box
            `}
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
