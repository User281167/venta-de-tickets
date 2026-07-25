"use client";

import {
  Box,
  Container,
  HStack,
  Image,
  Text,
  chakra,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useEffect, useState } from "react";

const LOGO = "/logos-la-u/Horizontal - letras blancas.png";

const NAV_ITEMS = [
  { label: "Por qué", href: "#por-que" },
  { label: "U del Futuro", href: "#u-del-futuro" },
  { label: "Experiencias", href: "#experiencias" },
  { label: "Asociación", href: "#asociacion" },
];

const NavLink = chakra(NextLink, {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    rounded: "full",
    px: 3.5,
    py: 1.5,
    fontFamily: "body",
    fontWeight: "400",
    fontSize: "sm",
    letterSpacing: "0.01em",
    color: "whiteAlpha.700",
    transition: "background 0.2s, color 0.2s",
    _hover: {
      bg: "whiteAlpha.100",
      color: "white",
    },
  },
});

const CtaLink = chakra(NextLink, {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    rounded: "full",
    px: 6,
    py: 1.5,
    fontFamily: "body",
    fontWeight: "600",
    fontSize: "sm",
    color: "utp.noche",
    bg: "utp.artico",
    transition: "all 0.2s",
    _hover: { bg: "white", transform: "translateY(-1px)" },
  },
});

const LogoLink = chakra(NextLink, {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    flexShrink: 0,
  },
});

export function SponsorNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      transition="all 0.3s ease"
      bg={scrolled ? "rgba(15, 18, 38, 0.45)" : "transparent"}
      backdropFilter={scrolled ? "blur(18px)" : "none"}
      borderBottomWidth={scrolled ? "1px" : "0px"}
      borderColor="transparent"
    >
      <Container maxW="7xl" py={3}>
        <Box
          rounded="full"
          bg={scrolled ? "whiteAlpha.50" : "transparent"}
          backdropFilter={scrolled ? "blur(20px)" : "blur(6px)"}
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          px={{ base: 3, md: 4 }}
          py={{ base: 1.5, md: 1.5 }}
        >
          <HStack justify="space-between" align="center" gap={4}>
            <HStack gap={4} flexShrink={0}>
              <LogoLink href="/aliados" aria-label="Inicio aliados">
                <Image
                  src={LOGO}
                  alt="La U del futuro"
                  h={{ base: "36px", md: "44px" }}
                  w="auto"
                  objectFit="contain"
                />
                <Text
                  display={{ base: "none", lg: "block" }}
                  fontFamily="body"
                  fontWeight="500"
                  fontSize="2xs"
                  letterSpacing="0.16em"
                  textTransform="uppercase"
                  color="whiteAlpha.700"
                  whiteSpace="nowrap"
                  pl={3}
                  borderLeftWidth="1px"
                  borderColor="whiteAlpha.200"
                >
                  UTP · 22, 23 y 24 de octubre
                </Text>
              </LogoLink>
            </HStack>

            <HStack
              as="nav"
              gap={1}
              display={{ base: "none", md: "flex" }}
              flex={1}
              justify="center"
            >
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </HStack>

            <CtaLink href="#aliados" flexShrink={0}>
              Ser Aliado
            </CtaLink>
          </HStack>
        </Box>
      </Container>
    </Box>
  );
}
