"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Image,
  Link as ChakraLink,
  Stack,
  VStack,
} from "@chakra-ui/react";
import {
  IconLogout,
  IconMenu2,
  IconShield,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/features/auth/api/auth.client";
import { useAuth } from "@/features/auth/hooks/useAuth";

const NAV_ITEMS = [
  { label: "INICIO", href: "/#hero" },
  { label: "LA CONVENCIÓN", href: "/#convencion" },
  { label: "AGENDA", href: "/agenda" },
  { label: "ACTIVIDADES", href: "/#actividades" },
  { label: "PONENTES", href: "/#speakers" },
  { label: "ENTRADAS", href: "/#entradas" },
  { label: "CONTACTO", href: "/#contacto" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/registro";
  const { user, role } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg="rgba(2, 4, 20, 0.76)"
      color="brand.light"
      borderBottomWidth="1px"
      borderColor="rgba(255,255,255,0.08)"
      backdropFilter="blur(18px)"
      transition="all 0.25s ease"
    >
      <Container maxW="8xl" px={{ base: 4, md: 6 }}>
        <Flex h={16} align="center" justify="space-between">
          <ChakraLink asChild _hover={{ textDecoration: "none" }}>
            <NextLink href="/">
              <Image src="/utp-logo.png" alt="UTP" h="42px" w="auto" />
            </NextLink>
          </ChakraLink>

          <HStack gap={7} hideBelow="xl">
            {NAV_ITEMS.map((item) => (
              <ChakraLink
                asChild
                key={item.href + item.label}
                textDecoration="none"
                color="brand.light"
                fontSize="xs"
                fontWeight="bold"
                borderBottom="2px solid"
                borderColor="transparent"
                transition="all 0.2s ease"
                _hover={{
                  borderColor: "brand.pink",
                  transform: "translateY(-2px)",
                  boxShadow: "0 0 42px rgba(0,229,255,0.42)",
                }}
              >
                <NextLink href={item.href}>{item.label}</NextLink>
              </ChakraLink>
            ))}
          </HStack>

          <HStack gap={3}>
            {user ? (
              <>
                {role !== "client" && (
                  <Button
                    asChild
                    variant="ghost"
                    color="white"
                    _hover={{ bg: "rgba(255,255,255,0.2)" }}
                    hideBelow="md"
                  >
                    <NextLink href="/admin">
                      <IconShield size={18} />
                      Admin
                    </NextLink>
                  </Button>
                )}

                <Button
                  asChild
                  variant="outline"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                  borderColor="brand.cyan"
                  hideBelow="md"
                >
                  <NextLink href="/mi-cuenta">
                    <IconUser size={18} />
                    Mi Perfil
                  </NextLink>
                </Button>

                <Button
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                  hideBelow="md"

                  onClick={handleLogout}
                >
                  <IconLogout size={18} />
                </Button>
              </>
            ) : (
              !isAuthPage && (
                <>
                  <Button
                    asChild
                    border="1px solid transparent"
                    hideBelow="sm"
                    size="md"
                    bg={`
                    linear-gradient(#020414, #020414) padding-box,
                    linear-gradient(90deg, #ff0f7b, #00e5ff) border-box
                  `}
                    _hover={{
                      borderColor: "brand.pink",
                      transform: "translateY(-2px)",
                      boxShadow: "0 0 42px rgba(0,229,255,0.42)",
                    }}
                    color="white"
                    fontWeight="bold"
                  >
                    <NextLink href="/login">INICIAR SESIÓN</NextLink>
                  </Button>

                  <Button
                    asChild
                    border="1px solid transparent"
                    hideBelow="sm"
                    size="md"
                    bg={`
                    linear-gradient(#020414, #020414) padding-box,
                    linear-gradient(90deg, #ff0f7b, #00e5ff) border-box
                  `}
                    _hover={{
                      borderColor: "brand.pink",
                      transform: "translateY(-2px)",
                      boxShadow: "0 0 42px rgba(0,229,255,0.42)",
                    }}
                    color="white"
                    fontWeight="bold"
                  >
                    <NextLink href="/registro">INSCRÍBETE</NextLink>
                  </Button>
                </>
              )
            )}

            <IconButton
              aria-label="Menu"
              color="white"
              size="md"
              hideFrom="xl"
              onClick={() => setOpen(!open)}
              variant="ghost"
            >
              {open ? <IconX size={24} /> : <IconMenu2 size={24} />}
            </IconButton>
          </HStack>
        </Flex>

        {open && (
          <Box hideFrom="xl" py="4">
            <Stack gap={3}>
              {NAV_ITEMS.map((item) => (
                <ChakraLink
                  asChild
                  key={item.href + item.label}
                  fontWeight="bold"
                  color="white"
                >
                  <NextLink href={item.href} onClick={() => setOpen(false)}>
                    {item.label}
                  </NextLink>
                </ChakraLink>
              ))}

              {user ? (
                <>
                  {role && (
                    <Button
                      asChild
                      variant="ghost"
                      color="white"
                      w="full"
                      onClick={() => setOpen(false)}
                    >
                      <NextLink href="/admin">
                        <IconShield size={18} />
                        Admin
                      </NextLink>
                    </Button>
                  )}

                  <Button
                    asChild
                    variant="outline"
                    w="full"
                    color="white"
                    onClick={() => setOpen(false)}
                  >
                    <NextLink href="/mi-cuenta">
                      <IconUser size={18} />
                      Mi Perfil
                    </NextLink>
                  </Button>

                  <Button
                    variant="ghost"
                    color="white"
                    w="full"
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                  >
                    <IconLogout size={18} />
                    Cerrar sesion
                  </Button>
                </>
              ) : (
                !isAuthPage && (
                  <VStack gap={2} pt={2}>
                    <Button asChild variant="outline" w="full" color="white">
                      <NextLink href="/login">Iniciar sesion</NextLink>
                    </Button>

                    <Button
                      asChild
                      w="full"
                      hideFrom="sm"
                      border="1px solid transparent"
                      bg={`
                        linear-gradient(#020414, #020414) padding-box,
                        linear-gradient(90deg, #ff0f7b, #00e5ff) border-box
                      `}
                      color="white"
                    >
                      <NextLink href="/registro">Registrarse</NextLink>
                    </Button>
                  </VStack>
                )
              )}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
}
