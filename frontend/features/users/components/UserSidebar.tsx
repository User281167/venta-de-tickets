"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  Link as ChakraLink,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/features/auth/api/auth.client";
import {
  IconCreditCard,
  IconHome,
  IconLayoutDashboard,
  IconTicket,
  IconUser,
  IconLogout,
} from "@tabler/icons-react";

const LINKS = [
  { href: "/", label: "Inicio", icon: IconHome },
  { href: "/mi-cuenta", label: "Resumen", icon: IconLayoutDashboard },
  { href: "/mi-cuenta/perfil", label: "Información", icon: IconUser },
  {
    href: "/mi-cuenta/entradas",
    label: "Mis entradas",
    icon: IconTicket,
  },
  {
    href: "/mi-cuenta/pagos",
    label: "Pagos",
    icon: IconCreditCard,
  },
];

export function UserSidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  const sidebarContent = (
    <>
      <VStack align="stretch" gap={2} flex={1}>
        {LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <ChakraLink
              asChild
              key={link.href}
              display="block"
              px={4}
              py={3}
              borderRadius="xl"
              border="1px solid"
              borderColor={isActive ? "transparent" : "transparent"}
              bg={
                isActive
                  ? "linear-gradient(90deg, rgba(255,15,123,0.18), rgba(0,229,255,0.12))"
                  : "transparent"
              }
              color={isActive ? "white" : "brand.muted"}
              fontWeight={isActive ? "bold" : "medium"}
              transition="all 0.2s ease"
              _hover={{
                bg: "rgba(255,255,255,0.06)",
                color: "white",
              }}
              position="relative"
              overflow="hidden"
            >
              <NextLink href={link.href} onClick={onClose}>
                <HStack gap={3}>
                  <Icon
                    size={20}
                    color={isActive ? "#00e5ff" : "#aeb8d8"}
                  />
                  <Text>{link.label}</Text>
                </HStack>
                {isActive && (
                  <Box
                    position="absolute"
                    left={0}
                    top="50%"
                    transform="translateY(-50%)"
                    w="3px"
                    h="60%"
                    borderRadius="full"
                    bg="linear-gradient(to bottom, #ff0f7b, #00e5ff)"
                  />
                )}
              </NextLink>
            </ChakraLink>
          );
        })}
      </VStack>

      <Button
        variant="ghost"
        color="brand.muted"
        _hover={{ bg: "rgba(239,68,68,0.1)", color: "red.300" }}
        onClick={handleLogout}
        w="full"
        justifyContent="flex-start"
        px={4}
        gap={3}
        borderRadius="xl"
        transition="all 0.2s ease"
      >
        <IconLogout size={20} />
        Cerrar sesión
      </Button>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <Box
          hideFrom="md"
          position="fixed"
          inset={0}
          bg="rgba(0,0,0,0.6)"
          backdropFilter="blur(4px)"
          zIndex={40}
          onClick={onClose}
        />
      )}

      <Flex
        hideFrom="md"
        direction="column"
        position="fixed"
        top={0}
        left={0}
        bottom={0}
        w="72"
        borderRight="1px solid rgba(255,255,255,0.08)"
        bg="brand.panel"
        p={4}
        zIndex={50}
        boxShadow="2xl"
        transform={mobileOpen ? "translateX(0)" : "translateX(-100%)"}
        transition="transform 0.3s ease"
      >
        <Text
          fontSize="xl"
          fontWeight="black"
          color="white"
          mb={8}
          px={2}
          className="gradient-text"
        >
          Mi cuenta
        </Text>
        {sidebarContent}
      </Flex>

      <Flex
        hideBelow="md"
        direction="column"
        w="64"
        flexShrink={0}
        borderRight="1px solid rgba(255,255,255,0.08)"
        bg="brand.panel"
        p={4}
        overflowY="auto"
      >
        <Text
          fontSize="xl"
          fontWeight="black"
          color="white"
          mb={8}
          px={2}
          className="gradient-text"
        >
          Mi cuenta
        </Text>
        {sidebarContent}
      </Flex>
    </>
  );
}
