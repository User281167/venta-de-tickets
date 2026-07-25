"use client";

import { Box, Container, HStack, Image, chakra } from "@chakra-ui/react";
import NextLink from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

const LOGO = "/logos-la-u/Horizontal - letras blancas.png";

const NavLink = chakra(NextLink, {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    rounded: "full",
    fontFamily: "body",
    fontWeight: "700",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    fontSize: "xs",
    transition: "all 0.2s",
  },
});

export function SponsorNavbar() {
  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg="rgba(15, 18, 38, 0.82)"
      color="utp.artico"
      borderBottomWidth="1px"
      borderColor="whiteAlpha.100"
      backdropFilter="blur(18px)"
      transition="all 0.25s ease"
    >
      <Container maxW="7xl">
        <HStack justify="space-between" align="center" py={4}>
          <NavLink href="/aliados" aria-label="Inicio aliados" px={2}>
            <Image
              src={LOGO}
              alt="La U del futuro"
              h="40px"
              w="auto"
              objectFit="contain"
            />
          </NavLink>

          <NavLink
            href="#aliados"
            px={5}
            py={2}
            bg="utp.azul"
            color="utp.noche"
            _hover={{ bg: "white" }}
          >
            <Box as="span">Quiero ser aliado</Box>
            <IconArrowRight size={14} />
          </NavLink>
        </HStack>
      </Container>
    </Box>
  );
}
