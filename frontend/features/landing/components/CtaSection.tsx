"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { IconArrowRight, IconUser } from "@tabler/icons-react";
import NextLink from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AnimatedSection } from "@/shared/components/AnimatedSection";

export function CtaSection() {
  const { user } = useAuth();

  return (
    <Box
      py={{ base: 16, md: 24 }}
      position="relative"
      overflow="hidden"
      bg="linear-gradient(100deg, #ff0f7b 0%, #4116a8 50%, #00d5b8 100%)"
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        bg: "url(/header.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.12,
        mixBlendMode: "overlay",
      }}
    >
      <Box
        position="absolute"
        inset={0}
        bg="linear-gradient(90deg, rgba(2,4,20,0.4), rgba(2,4,20,0.1))"
      />

      <Container
        maxW="8xl"
        px={{ base: 4, md: 6 }}
        position="relative"
        zIndex={1}
      >
        <AnimatedSection direction="up" delay={0} duration={0.6}>
          <Flex
            direction={{ base: "column", lg: "row" }}
            align={{ base: "center", lg: "center" }}
            justify="space-between"
            gap={{ base: 8, lg: 12 }}
            textAlign={{ base: "center", lg: "left" }}
          >
          <Stack gap={4} maxW="700px">
            <Heading
              color="white"
              fontSize={{ base: "3xl", md: "5xl" }}
              lineHeight="1.05"
              textTransform="uppercase"
            >
              Sé parte del futuro,
              <br />
              sé parte de la{" "}
              <Text className="inline" color="brand.blue">
                U.
              </Text>
            </Heading>

            <Text color="white" fontSize={{ base: "md", md: "xl" }} opacity={0.92}>
              {user
                ? "Ya haces parte de la comunidad. Revisa tu cuenta y prepárate para vivir La U del Futuro."
                : "Inscríbete hoy y asegura tu cupo en el evento más inspirador del año. Cupos limitados."}
            </Text>
          </Stack>

          <Stack gap={3} align={{ base: "stretch", md: "center" }} minW={{ lg: "280px" }}>
            {user ? (
              <Button
                asChild
                size={{ base: "md", md: "lg" }}
                px={{ base: 6, md: 8 }}
                minH="56px"
                bg="white"
                color="#12162b"
                borderRadius="10px"
                fontWeight="bold"
                boxShadow="0 0 30px rgba(255,255,255,0.22)"
                transition="all 0.25s ease"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 0 42px rgba(0,229,255,0.42)",
                }}
              >
                <NextLink href="/mi-cuenta">
                  IR A MI CUENTA <IconUser size={22} />
                </NextLink>
              </Button>
            ) : (
              <Button
                asChild
                size={{ base: "md", md: "lg" }}
                px={{ base: 6, md: 8 }}
                minH="56px"
                bg="white"
                color="#12162b"
                borderRadius="10px"
                fontWeight="bold"
                boxShadow="0 0 30px rgba(255,255,255,0.22)"
                transition="all 0.25s ease"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 0 42px rgba(0,229,255,0.42)",
                }}
              >
                <NextLink href="/registro">
                  INSCRÍBETE AHORA <IconArrowRight size={22} />
                </NextLink>
              </Button>
            )}

            <Text color="white" fontSize="sm" textAlign="center" opacity={0.9}>
              {user ? "Nos vemos en octubre" : "Cupos limitados"}
            </Text>
          </Stack>
          </Flex>
        </AnimatedSection>
      </Container>
    </Box>
  );
}
