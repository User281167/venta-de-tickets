import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Link as ChakraLink,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconTicket,
  IconUsers,
} from "@tabler/icons-react";
import NextLink from "next/link";

export function HeroSection() {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      background="url(/conferencia-1.jpg) center/cover no-repeat"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        bg: "rgba(48, 56, 65, 0.75)",
      }}
    >
      <Container maxW="1200px" px={4} position="relative" zIndex={1}>
        <Stack gap={6} maxW="3xl">
          <Heading
            as="h1"
            size={{ base: "3xl", md: "4xl" }}
            color="white"
            lineHeight="1.1"
          >
            FUTURE MINDS 2026: Ideas que están cambiando el mundo
          </Heading>
          <Text fontSize={{ base: "md", md: "lg" }} color="gray.200">
            Una experiencia única con expertos en tecnología, emprendimiento e
            innovación dentro del campus universitario.
          </Text>
          <Text fontSize="sm" color="gray.300" maxW="lg">
            Descubre cómo los líderes del futuro están construyendo hoy las
            industrias del mañana. Charlas, networking y acceso exclusivo a
            referentes globales.
          </Text>

          <HStack gap={4} wrap="wrap">
            <NextLink href="/#entradas" passHref>
              <ChakraLink>
                <Button
                  size="lg"
                  colorPalette="orange"
                  _hover={{ transform: "translateY(-2px)" }}
                >
                  <IconTicket size={20} />
                  Consigue tu boleta
                </Button>
              </ChakraLink>
            </NextLink>

            <NextLink href="/#agenda" passHref>
              <ChakraLink>
                <Button
                  size="lg"
                  variant="outline"
                  colorPalette="teal"
                  color="white"
                  borderColor="brand.teal"
                  _hover={{ bg: "rgba(118, 171, 174, 0.15)" }}
                >
                  <IconCalendar size={20} />
                  Ver agenda del evento
                </Button>
              </ChakraLink>
            </NextLink>
          </HStack>

          <Stack gap={3} pt={4}>
            <HStack gap={2} color="gray.300">
              <IconMapPin size={18} />
              <Text fontSize="sm">Universidad Central (Campus principal)</Text>
            </HStack>
            <HStack gap={2} color="gray.300">
              <IconCalendar size={18} />
              <Text fontSize="sm">18 de Octubre 2026</Text>
            </HStack>
            <HStack gap={2} color="gray.300">
              <IconClock size={18} />
              <Text fontSize="sm">9:00 AM – 6:00 PM</Text>
            </HStack>
            <HStack gap={2} color="gray.300">
              <IconUsers size={18} />
              <Text fontSize="sm">Cupos limitados</Text>
            </HStack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
