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
import { IconBrain, IconMenu2, IconUser, IconX } from "@tabler/icons-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";

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
  const { user } = useAuth();

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
          <ChakraLink asChild _hover={{ textDecoration: "none" }}>
            <NextLink href="/">
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
            </NextLink>
          </ChakraLink>

          <HStack gap={8} hideBelow="md">
            {NAV_ITEMS.map((item) => (
              <ChakraLink asChild key={item.href} fontSize="sm" fontWeight="medium" color={linkColor} _hover={{ color: "brand.teal" }}>
                <NextLink href={item.href}>
                  {item.label}
                </NextLink>
              </ChakraLink>
            ))}
          </HStack>

          <HStack gap={3} hideBelow="md">
            {user ? (
              <Button asChild variant={scrolled ? "outline" : "solid"} size="sm" colorPalette={scrolled ? "teal" : "white"}>
                <NextLink href="/mi-cuenta">
                  <IconUser size={18} />
                  Mi Perfil
                </NextLink>
              </Button>
            ) : (
              !isAuthPage && (
                <>
                  <Button asChild variant={scrolled ? "outline" : "solid"} size="sm" colorPalette={scrolled ? "teal" : "white"}>
                    <NextLink href="/login">
                      Iniciar sesión
                    </NextLink>
                  </Button>

                  <Button asChild size="sm" colorPalette="orange">
                    <NextLink href="/registro">
                      Registrarse
                    </NextLink>
                  </Button>
                </>
              )
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
                <ChakraLink asChild key={item.href} fontSize="sm" fontWeight="medium" color={scrolled ? "brand.dark" : "white"}>
                  <NextLink href={item.href} onClick={() => setOpen(false)}>
                    {item.label}
                  </NextLink>
                </ChakraLink>
              ))}
              {user ? (
                <Button asChild variant="outline" size="sm" w="full" colorPalette="teal" onClick={() => setOpen(false)}>
                  <NextLink href="/mi-cuenta">
                    <IconUser size={18} />
                    Mi Perfil
                  </NextLink>
                </Button>
              ) : (
                !isAuthPage && (
                  <HStack gap={2} pt={2}>
                    <Button asChild variant="outline" size="sm" w="full" colorPalette={scrolled ? "teal" : "white"}>
                      <NextLink href="/login">
                        Iniciar sesión
                      </NextLink>
                    </Button>

                    <Button asChild size="sm" w="full" colorPalette="orange">
                      <NextLink href="/registro">
                        Registrarse
                      </NextLink>
                    </Button>
                  </HStack>
                )
              )}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
}
