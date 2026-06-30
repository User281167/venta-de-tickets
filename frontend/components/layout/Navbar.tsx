"use client";

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
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Inicio", href: "/#hero" },
  { label: "Programa", href: "/#agenda" },
  { label: "Speakers", href: "/#speakers" },
  { label: "Entradas", href: "/#entradas" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/registro";

  return (
    <Box
      as="nav"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg="brand.light"
      borderBottomWidth={1}
      borderColor="gray.200"
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
                  color="brand.dark"
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
                  color="brand.dark"
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
                    <Button variant="outline" size="sm" colorPalette="teal">
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
            onClick={() => setOpen(!open)}
          >
            {open ? <IconX size={24} /> : <IconMenu2 size={24} />}
          </IconButton>
        </Flex>

        {open && (
          <Box pb={4} hideFrom="md">
            <Stack gap={3}>
              {NAV_ITEMS.map((item) => (
                <NextLink key={item.href} href={item.href} passHref>
                  <ChakraLink
                    fontSize="sm"
                    fontWeight="medium"
                    color="brand.dark"
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
                        colorPalette="teal"
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
