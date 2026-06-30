"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Link as ChakraLink,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  IconCheck,
  IconCrown,
  IconShoppingCart,
  IconStar,
  IconTicket,
} from "@tabler/icons-react";
import NextLink from "next/link";

const TIERS = [
  {
    name: "General",
    price: "$15",
    icon: IconTicket,
    iconBg: "brand.teal",
    features: ["Acceso a todas las charlas", "Certificado digital"],
  },
  {
    name: "Premium",
    price: "$35",
    icon: IconStar,
    iconBg: "brand.dark",
    features: [
      "Asiento preferencial",
      "Acceso a networking VIP",
      "Kit del evento",
    ],
    highlighted: true,
  },
  {
    name: "VIP Experience",
    price: "$75",
    icon: IconCrown,
    iconBg: "brand.orange",
    features: [
      "Meet & Greet con speakers",
      "Acceso a zona exclusiva",
      "Grabaciones completas del evento",
      "Certificado físico firmado",
    ],
  },
];

export function TicketSection() {
  return (
    <Box id="entradas" py={20} bg="gray.50">
      <Container maxW="1200px" px={4}>
        <Stack gap={3} align="center" mb={12}>
          <Heading
            as="h2"
            size={{ base: "2xl", md: "3xl" }}
            color="brand.dark"
            textAlign="center"
          >
            Elige tu entrada
          </Heading>
          <Text color="gray.600" textAlign="center" maxW="lg">
            Selecciona el plan que mejor se adapte a ti y asegura tu lugar en
            Future Minds 2026
          </Text>
        </Stack>

        <Flex justify="center" align="center" gap={8} wrap="wrap">
          {TIERS.map((tier, i) => {
            const isCenter = i === 1;
            return (
              <Flex
                key={tier.name}
                direction="column"
                bg="white"
                borderRadius="2xl"
                borderWidth={tier.highlighted ? 2 : 1}
                borderColor={tier.highlighted ? "brand.teal" : "gray.200"}
                boxShadow={tier.highlighted ? "xl" : "md"}
                overflow="hidden"
                w={{ base: "full", md: "360px" }}
                minH="480px"
                mt={isCenter ? 0 : 10}
                _hover={{ transform: "translateY(-8px)", boxShadow: "xl" }}
                transition="all 0.25s"
              >
                {tier.highlighted && (
                  <Box bg="brand.teal" py={2} textAlign="center">
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      color="white"
                      textTransform="uppercase"
                      letterSpacing="wide"
                    >
                      Más popular
                    </Text>
                  </Box>
                )}

                <Box p={8} pb={0}>
                  <HStack gap={4} mb={6}>
                    <Flex
                      w={14}
                      h={14}
                      bg={tier.iconBg}
                      borderRadius="xl"
                      align="center"
                      justify="center"
                      flexShrink={0}
                    >
                      <Icon as={tier.icon} boxSize={7} color="white" />
                    </Flex>
                    <Stack gap={0}>
                      <Text fontSize="xl" fontWeight="bold" color="brand.dark">
                        {tier.name}
                      </Text>
                      <Text
                        fontSize="3xl"
                        fontWeight="bold"
                        color="brand.teal"
                        lineHeight="1"
                      >
                        {tier.price}
                        <Text
                          as="span"
                          fontSize="sm"
                          fontWeight="normal"
                          color="gray.400"
                        >
                          {" "}
                          USD
                        </Text>
                      </Text>
                    </Stack>
                  </HStack>

                  <VStack gap={3} align="start">
                    {tier.features.map((feature) => (
                      <HStack key={feature} gap={3}>
                        <Flex
                          w={6}
                          h={6}
                          bg="rgba(118,171,174,0.12)"
                          borderRadius="full"
                          align="center"
                          justify="center"
                          flexShrink={0}
                        >
                          <IconCheck size={14} color="#76ABAE" />
                        </Flex>
                        <Text fontSize="sm" color="gray.600">
                          {feature}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                <Box p={8} mt="auto">
                  <NextLink href="/registro" passHref>
                    <ChakraLink>
                      <Button
                        w="full"
                        size="lg"
                        colorPalette={tier.highlighted ? "teal" : "teal"}
                        variant={tier.highlighted ? "solid" : "outline"}
                        borderRadius="xl"
                      >
                        <IconShoppingCart size={18} />
                        Comprar{" "}
                        {tier.name === "VIP Experience" ? "VIP" : tier.name}
                      </Button>
                    </ChakraLink>
                  </NextLink>
                </Box>
              </Flex>
            );
          })}
        </Flex>
      </Container>
    </Box>
  );
}
