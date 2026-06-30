"use client";

import { Box, Container, Flex, Heading, Icon, Stack, Text } from "@chakra-ui/react";
import { IconBrain, IconBulb, IconHeartHandshake, IconRocket, IconWorld } from "@tabler/icons-react";

const HIGHLIGHTS = [
  { icon: IconRocket, text: "Charlas con expertos de la industria" },
  { icon: IconBrain, text: "Talleres prácticos y experiencias inmersivas" },
  { icon: IconHeartHandshake, text: "Networking con estudiantes y profesionales" },
  { icon: IconBulb, text: "Innovación y tendencias tecnológicas" },
  { icon: IconWorld, text: "Visión global del mercado laboral" },
];

export function AboutSection() {
  return (
    <Box id="sobre-el-evento" py={20}>
      <Container maxW="1200px" px={4}>
        <Flex direction={{ base: "column", lg: "row" }} gap={12} align="center">
          <Stack gap={5} flex={1}>
            <Heading as="h2" size={{ base: "2xl", md: "3xl" }} color="brand.dark">
              ¿Qué es Future Minds?
            </Heading>
            <Text fontSize="lg" color="gray.600" lineHeight="1.8">
              Future Minds es una jornada académica y experiencial diseñada para conectar estudiantes con líderes de la industria tecnológica, emprendimiento, inteligencia artificial, innovación social y desarrollo profesional.
            </Text>
            <Text color="gray.600" lineHeight="1.8">
              Durante un día completo, vivirás charlas inspiradoras, paneles interactivos y espacios de networking con invitados internacionales y nacionales.
            </Text>
          </Stack>

          <Stack gap={4} flex={1} w="full">
            {HIGHLIGHTS.map((item) => (
              <Flex key={item.text} gap={4} align="center" p={4} bg="white" borderRadius="lg" boxShadow="sm" borderWidth={1} borderColor="gray.100">
                <Flex w={12} h={12} bg="brand.teal" borderRadius="lg" align="center" justify="center" flexShrink={0}>
                  <Icon as={item.icon} boxSize={6} color="white" />
                </Flex>
                <Text fontWeight="medium" color="brand.dark">{item.text}</Text>
              </Flex>
            ))}
          </Stack>
        </Flex>
      </Container>
    </Box>
  );
}
