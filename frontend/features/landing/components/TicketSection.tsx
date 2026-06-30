"use client";

import { Box, Button, Container, Flex, Grid, Heading, HStack, Icon, Link as ChakraLink, Stack, Text, VStack } from "@chakra-ui/react";
import { IconCheck, IconCrown, IconStar, IconTicket, IconUsers } from "@tabler/icons-react";
import NextLink from "next/link";

const TIERS = [
  {
    name: "General",
    price: "$15",
    icon: IconTicket,
    color: "brand.teal",
    features: ["Acceso a todas las charlas", "Certificado digital"],
  },
  {
    name: "Premium",
    price: "$35",
    icon: IconStar,
    color: "brand.dark",
    features: ["Asiento preferencial", "Acceso a networking VIP", "Kit del evento"],
    highlighted: true,
  },
  {
    name: "VIP Experience",
    price: "$75",
    icon: IconCrown,
    color: "brand.orange",
    features: ["Meet & Greet con speakers", "Acceso a zona exclusiva", "Grabaciones completas del evento", "Certificado físico firmado"],
  },
];

export function TicketSection() {
  return (
    <Box id="entradas" py={20}>
      <Container maxW="1200px" px={4}>
        <Stack gap={3} align="center" mb={12}>
          <Heading as="h2" size={{ base: "2xl", md: "3xl" }} color="brand.dark" textAlign="center">
            Elige tu entrada
          </Heading>
          <Text color="gray.600" textAlign="center" maxW="lg">
            Selecciona el plan que mejor se adapte a ti y asegura tu lugar en Future Minds 2026
          </Text>
        </Stack>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} maxW="5xl" mx="auto">
          {TIERS.map((tier) => (
            <Flex
              key={tier.name}
              direction="column"
              bg="white"
              borderRadius="xl"
              borderWidth={tier.highlighted ? 2 : 1}
              borderColor={tier.highlighted ? "brand.teal" : "gray.200"}
              boxShadow={tier.highlighted ? "lg" : "sm"}
              overflow="hidden"
              _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
              transition="all 0.2s"
            >
              {tier.highlighted && (
                <Box bg="brand.teal" py={1.5} textAlign="center">
                  <Text fontSize="xs" fontWeight="bold" color="white" textTransform="uppercase" letterSpacing="wide">
                    Más popular
                  </Text>
                </Box>
              )}

              <Stack p={6} gap={4} flex={1}>
                <Flex w={12} h={12} bg={`${tier.color}15`} borderRadius="lg" align="center" justify="center">
                  <Icon as={tier.icon} boxSize={6} color={tier.color} />
                </Flex>

                <Text fontSize="xl" fontWeight="bold" color="brand.dark">
                  {tier.name}
                </Text>

                <Text fontSize="3xl" fontWeight="bold" color={tier.color}>
                  {tier.price}
                  <Text as="span" fontSize="sm" fontWeight="normal" color="gray.500"> USD</Text>
                </Text>

                <VStack gap={2} align="start" pt={2}>
                  {tier.features.map((feature) => (
                    <HStack key={feature} gap={2}>
                      <IconCheck size={16} color="#76ABAE" />
                      <Text fontSize="sm" color="gray.600">{feature}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Stack>

              <Box p={6} pt={0}>
                <NextLink href="/registro" passHref legacyBehavior>
                  <ChakraLink>
                    <Button w="full" colorPalette={tier.color === "brand.orange" ? "orange" : tier.highlighted ? "teal" : "gray"} variant={tier.highlighted ? "solid" : "outline"}>
                      Compra tu boleta ahora – Cupos limitados
                    </Button>
                  </ChakraLink>
                </NextLink>
              </Box>
            </Flex>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
