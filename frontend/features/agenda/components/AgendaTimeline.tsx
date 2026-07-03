"use client";

import {
  Box,
  Container,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  IconBrain,
  IconBulb,
  IconClock,
  IconCoffee,
  IconRocket,
  IconTicket,
} from "@tabler/icons-react";

const DAYS = [
  {
    date: "22 de Octubre 2026",
    icon: IconTicket,
    color: "brand.teal",
    items: [
      { time: "09:00", title: "Registro y bienvenida", icon: IconCoffee },
      {
        time: "10:00",
        title: "Keynote: Innovación en Colombia",
        icon: IconBrain,
      },
      { time: "11:30", title: "Panel: Emprender sin capital", icon: IconBulb },
      {
        time: "14:00",
        title: "Taller: Transformación digital",
        icon: IconRocket,
      },
    ],
  },
  {
    date: "23 de Octubre 2026",
    icon: IconBulb,
    color: "brand.violet",
    items: [
      { time: "09:30", title: "Workshop: IA para negocios", icon: IconBrain },
      { time: "11:00", title: "Panel: Fintech colombiano", icon: IconBulb },
      { time: "13:00", title: "Networking lunch", icon: IconCoffee },
      { time: "15:00", title: "Charla: Escalando startups", icon: IconRocket },
    ],
  },
  {
    date: "24 de Octubre 2026",
    icon: IconRocket,
    color: "brand.pink",
    items: [
      { time: "08:30", title: "Sesión de apertura", icon: IconBrain },
      { time: "10:00", title: "Demo day: Startups", icon: IconRocket },
      { time: "13:00", title: "Almuerzo de cierre", icon: IconCoffee },
      { time: "16:00", title: "Premiación y cierre", icon: IconClock },
    ],
  },
];

export function AgendaTimeline() {
  return (
    <Box as="section" py={20}>
      <Container maxW="6xl" px={4}>
        <Flex gap={16} justifyContent="space-around" wrap="wrap">
          {DAYS.map((day, idx) => (
            <Box key={day.date} mt={{ xl: 10 * idx }}>
              <Flex align="center" gap={3} mb={8}>
                <Box
                  w={10}
                  h={10}
                  bg={day.color}
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={day.icon} boxSize={5} color="white" />
                </Box>

                <Heading as="h3" size="lg" color={day.color}>
                  {day.date}
                </Heading>
              </Flex>

              <VStack gap={0} position="relative" pl={{ base: 0, md: 14 }}>
                <Box
                  position="absolute"
                  left={{ base: 6, md: 20 }}
                  top={0}
                  bottom={0}
                  w="2px"
                  bg={day.color}
                  opacity={0.25}
                  hideBelow="sm"
                />

                {day.items.map((item) => (
                  <Flex
                    key={item.time}
                    gap={4}
                    w="full"
                    py={3}
                    position="relative"
                  >
                    <Flex
                      w={10}
                      h={10}
                      bg={day.color}
                      borderRadius="full"
                      align="center"
                      justify="center"
                      flexShrink={0}
                      zIndex={1}
                      boxShadow="md"
                    >
                      <Icon as={item.icon} boxSize={4} color="white" />
                    </Flex>

                    <Stack gap={0} justify="center">
                      <Text fontSize="sm" fontWeight="bold" color={day.color}>
                        {item.time}
                      </Text>
                      <Text
                        fontSize="md"
                        fontWeight="medium"
                        color="brand.light"
                      >
                        {item.title}
                      </Text>
                    </Stack>
                  </Flex>
                ))}
              </VStack>
            </Box>
          ))}
        </Flex>
      </Container>
    </Box>
  );
}
