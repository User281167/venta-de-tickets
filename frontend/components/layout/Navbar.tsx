"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Link as ChakraLink,
  Stack,
  Text,
} from "@chakra-ui/react";
import { IconBrain, IconMenu2, IconX } from "@tabler/icons-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Inicio", href: "/#hero" },
  { label: "Programa", href: "/#agenda" },
  { label: "Speakers", href: "/#speakers" },
  { label: "Entradas", href: "/#entradas" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/registro";

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkColor = scrolled ? "brand.dark" : "white";

  return (
    <Box
      as="nav"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg={scrolled ? "white" : "transparent"}
      borderBottomWidth={scrolled ? 1 : 0}
      borderColor="gray.200"
      transition="all 0.25s ease"
    >
      <Container maxW="1200px" px={4}>
        <Flex h={16} align="center" justify="space-between">
          <NextLink href="/" passHref>
            <ChakraLink _hover={{ textDecoration: "none" }}>
              <HStack gap={2}>
                <IconBrain size={28} color="#76ABAE" />
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color={linkColor}
                  hideBelow="sm"
                >
                  Future Minds 2026
                </Text>
              </HStack>
            </ChakraLink>
          </NextLink>

          <HStack gap={8} hideBelow="md">
            {NAV_ITEMS.map((item) => (
              <NextLink key={item.href} href={item.href} passHref>
                <ChakraLink
                  fontSize="sm"
                  fontWeight="medium"
                  color={linkColor}
                  _hover={{ color: "brand.teal" }}
                >
                  {item.label}
                </ChakraLink>
              </NextLink>
            ))}
          </HStack>

          <HStack gap={3} hideBelow="md">
            {!isAuthPage && (
              <>
                <NextLink href="/login" passHref>
                  <ChakraLink>
                    <Button
                      variant={scrolled ? "outline" : "solid"}
                      size="sm"
                      colorPalette={scrolled ? "teal" : "white"}
                    >
                      Iniciar sesión
                    </Button>
                  </ChakraLink>
                </NextLink>

                <NextLink href="/registro" passHref>
                  <ChakraLink>
                    <Button size="sm" colorPalette="orange">
                      Registrarse
                    </Button>
                  </ChakraLink>
                </NextLink>
              </>
            )}
          </HStack>

          <IconButton
            aria-label="Menú"
            variant="ghost"
            size="md"
            hideFrom="md"
            color={linkColor}
            onClick={() => setOpen(!open)}
          >
            {open ? <IconX size={24} /> : <IconMenu2 size={24} />}
          </IconButton>
        </Flex>

        {open && (
          <Box
            pb={4}
            hideFrom="md"
            bg={scrolled ? "white" : "rgba(48,56,65,0.95)"}
            borderRadius="xl"
            p={4}
          >
            <Stack gap={3}>
              {NAV_ITEMS.map((item) => (
                <NextLink key={item.href} href={item.href} passHref>
                  <ChakraLink
                    fontSize="sm"
                    fontWeight="medium"
                    color={scrolled ? "brand.dark" : "white"}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </ChakraLink>
                </NextLink>
              ))}
              {!isAuthPage && (
                <HStack gap={2} pt={2}>
                  <NextLink href="/login" passHref>
                    <ChakraLink>
                      <Button
                        variant="outline"
                        size="sm"
                        w="full"
                        colorPalette={scrolled ? "teal" : "white"}
                      >
                        Iniciar sesión
                      </Button>
                    </ChakraLink>
                  </NextLink>

                  <NextLink href="/registro" passHref>
                    <ChakraLink>
                      <Button size="sm" w="full" colorPalette="orange">
                        Registrarse
                      </Button>
                    </ChakraLink>
                  </NextLink>
                </HStack>
              )}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
}
