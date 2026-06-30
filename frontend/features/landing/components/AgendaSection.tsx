"use client";

import { Box, Container, Flex, Heading, Icon, Stack, Text, VStack } from "@chakra-ui/react";
import { IconBrain, IconBulb, IconClock, IconCoffee, IconRocket, IconTicket } from "@tabler/icons-react";

const AGENDA_ITEMS = [
  { time: "09:00", title: "Registro y bienvenida", icon: IconTicket },
  { time: "10:00", title: "Keynote: El futuro de la tecnología", icon: IconBrain },
  { time: "11:30", title: "Panel: Emprender sin capital", icon: IconBulb },
  { time: "13:00", title: "Almuerzo y networking", icon: IconCoffee },
  { time: "14:30", title: "Charlas simultáneas (IA, negocios, innovación)", icon: IconRocket },
  { time: "17:00", title: "Cierre inspiracional y sorteo de becas", icon: IconClock },
];

export function AgendaSection() {
  return (
    <Box id="agenda" py={20}>
      <Container maxW="800px" px={4}>
        <Stack gap={3} align="center" mb={12}>
          <Heading as="h2" size={{ base: "2xl", md: "3xl" }} color="brand.dark" textAlign="center">
            Programa del día
          </Heading>
          <Text color="gray.600" textAlign="center" maxW="lg">
            18 de Octubre 2026 — Un día completo de aprendizaje y conexiones
          </Text>
        </Stack>

        <VStack gap={0} position="relative">
          <Box position="absolute" left={6} top={0} bottom={0} w="2px" bg="brand.teal" opacity={0.3} hideBelow="sm" />

          {AGENDA_ITEMS.map((item) => (
            <Flex key={item.time} gap={4} w="full" py={4} position="relative">
              <Flex
                w={12}
                h={12}
                bg="brand.teal"
                borderRadius="full"
                align="center"
                justify="center"
                flexShrink={0}
                zIndex={1}
                boxShadow="md"
              >
                <Icon as={item.icon} boxSize={5} color="white" />
              </Flex>

              <Stack gap={0} justify="center">
                <Text fontSize="sm" fontWeight="bold" color="brand.teal">
                  {item.time}
                </Text>
                <Text fontSize="md" fontWeight="medium" color="brand.dark">
                  {item.title}
                </Text>
              </Stack>
            </Flex>
          ))}
        </VStack>
      </Container>
    </Box>
  );
}
