"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Image,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  IconArrowRight,
  IconCalendar,
  IconMapPin,
  IconUser,
} from "@tabler/icons-react";
import NextLink from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AnimatedSection } from "@/shared/components/AnimatedSection";

export function HeroSection() {
  const { user } = useAuth();

  return (
    <Box
      id="hero"
      minH={{ base: "calc(100vh - 24px)", lg: "92vh" }}
      display="flex"
      alignItems="center"
      backgroundImage="url(/header.png)"
      backgroundSize="cover"
      backgroundPosition={{ base: "58% center", lg: "center" }}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        bg: {
          base: "linear-gradient(90deg, rgba(2,4,20,0.94), rgba(2,4,20,0.62))",
          lg: "linear-gradient(90deg, rgba(2,4,20,0.52), rgba(2,4,20,0.12))",
        },
      }}
    >
      <Container
        maxW="7xl"
        px={{ base: 4, md: 6 }}
        position="relative"
        zIndex={1}
      >
        <AnimatedSection direction="up" delay={0} duration={0.6}>
          <Stack
            gap={{ base: 6, md: 8 }}
            maxW={{ base: "full", md: "720px" }}
          >
          <Flex
            gap={{ base: 4, md: 6 }}
            flexDir={{ base: "column", md: "row" }}
            align={{ md: "flex-end" }}
          >
            <Image
              src="/la-u.png"
              alt="La U"
              w={{ base: "40", md: "sm" }}
              className="animate-float"
              transition="transform 0.3s ease"
              _hover={{ transform: "scale(1.03)" }}
            />

            <Stack gap={2}>
              <Heading
                as="h1"
                fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
                color="white"
                lineHeight="0.95"
                fontWeight="black"
                textTransform="uppercase"
              >
                del futuro
              </Heading>

              <Text
                fontSize={{ base: "lg", md: "2xl" }}
                color="white"
                textTransform="uppercase"
                lineHeight="1.35"
              >
                Conectamos{" "}
                <Box as="span" color="brand.pink">
                  talento
                </Box>
                , impulsamos el{" "}
                <Box as="span" color="brand.cyan">
                  futuro
                </Box>
              </Text>
            </Stack>
          </Flex>

          <Separator maxW="360px" borderColor="brand.cyan" opacity={0.8} />

          <Stack gap={5} color="white" maxW="sm">
            <HStack gap={4} align="center">
              <Box
                p={2.5}
                borderRadius="full"
                bg="rgba(255,15,123,0.12)"
                border="1px solid rgba(255,15,123,0.25)"
              >
                <IconCalendar stroke={1} size={40} color="#ff0f7b" />
              </Box>

              <Stack gap={0}>
                <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="black">
                  22, 23 y 24
                </Text>

                <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold">
                  de octubre de{" "}
                  <Box as="span" color="brand.cyan">
                    2026
                  </Box>
                </Text>
              </Stack>
            </HStack>

            <HStack gap={4} align="center">
              <Box
                p={2.5}
                borderRadius="full"
                bg="rgba(0,229,255,0.12)"
                border="1px solid rgba(0,229,255,0.25)"
              >
                <IconMapPin stroke={1} size={40} color="#00e5ff" />
              </Box>

              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="medium">
                Universidad Tecnológica de Pereira
                <br />
                Pereira, Risaralda - Colombia
              </Text>
            </HStack>

            {user ? (
              <Button
                asChild
                w="full"
                alignSelf="flex-start"
                size={{ base: "md", md: "lg" }}
                px={{ base: 6, md: 8 }}
                minH="54px"
                bg="linear-gradient(90deg, #00e5ff 0%, #0969ff 100%)"
                color="white"
                borderRadius="10px"
                fontWeight="black"
                boxShadow="0 0 34px rgba(0,229,255,0.35)"
                transition="all 0.25s ease"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 0 42px rgba(0,229,255,0.42)",
                }}
              >
                <NextLink href="/mi-cuenta">
                  IR A MI CUENTA <IconUser size={24} />
                </NextLink>
              </Button>
            ) : (
              <Button
                asChild
                w="full"
                alignSelf="flex-start"
                size={{ base: "md", md: "lg" }}
                px={{ base: 6, md: 8 }}
                minH="54px"
                bg="linear-gradient(90deg, #ff0f7b 0%, #0969ff 100%)"
                color="white"
                borderRadius="10px"
                fontWeight="black"
                boxShadow="0 0 34px rgba(255,15,123,0.35)"
                className="animate-pulse-glow"
                transition="all 0.25s ease"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 0 42px rgba(0,229,255,0.42)",
                }}
              >
                <NextLink href="/registro">
                  INSCRÍBETE AHORA <IconArrowRight size={24} />
                </NextLink>
              </Button>
            )}
          </Stack>
        </Stack>
        </AnimatedSection>
      </Container>
    </Box>
  );
}
