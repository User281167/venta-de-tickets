"use client";

import {
  Box,
  Flex,
  HStack,
  IconButton,
  Link as ChakraLink,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  IconUser,
  IconCreditCard,
  IconTicket,
  IconX,
  IconTransitionRightFilled,
  IconHome,
} from "@tabler/icons-react";

const LINKS = [
  { href: "/", label: "Home", icon: <IconHome size={20} /> },
  { href: "/mi-cuenta", label: "Información", icon: <IconUser size={20} /> },
  {
    href: "/mi-cuenta/entradas",
    label: "Mis Entradas",
    icon: <IconTicket size={20} />,
  },
  {
    href: "/mi-cuenta/pagos",
    label: "Pagos",
    icon: <IconCreditCard size={20} />,
  },
];

export function UserSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleNav() {
    setMobileOpen(false);
  }

  const sidebarContent = (
    <VStack align="stretch" gap={1} flex={1}>
      {LINKS.map((link) => {
        const isActive = pathname === link.href;

        return (
          <ChakraLink
            asChild
            key={link.href}
            display="block"
            px={4}
            py={2.5}
            borderRadius="md"
            bg={isActive ? "teal.50" : "transparent"}
            color={isActive ? "teal.700" : "white"}
            fontWeight={isActive ? "semibold" : "medium"}
            _hover={{
              bg: isActive ? "teal.50" : "gray.100",
              color: isActive ? "teal.700" : "gray.800",
            }}
            transition="all 0.15s"
          >
            <NextLink href={link.href} onClick={handleNav}>
              <HStack gap={3}>
                {link.icon}
                <Text>{link.label}</Text>
              </HStack>
            </NextLink>
          </ChakraLink>
        );
      })}
    </VStack>
  );

  return (
    <>
      <IconButton
        aria-label="Menú"
        variant="ghost"
        size="md"
        hideFrom="md"
        position="fixed"
        border="1px solid"
        borderColor="white"
        top="4"
        right="4"
        hidden={mobileOpen}
        zIndex={1100}
        bg="white"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? (
          <IconX size={24} />
        ) : (
          <IconTransitionRightFilled size={24} />
        )}
      </IconButton>

      {mobileOpen && (
        <Box
          hideFrom="md"
          position="fixed"
          inset={0}
          bg="rgba(0,0,0,0.5)"
          zIndex={1000}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Flex
        hideFrom="md"
        direction="column"
        position="fixed"
        top={0}
        left={0}
        bottom={0}
        w="64"
        borderRight="1px"
        borderColor="gray.200"
        bg="brand.dark"
        p={4}
        zIndex={1050}
        boxShadow="lg"
        transform={mobileOpen ? "translateX(0)" : "translateX(-100%)"}
        transition="transform 0.25s ease"
      >
        {sidebarContent}
      </Flex>

      <Flex
        hideBelow="md"
        direction="column"
        borderRight="1px solid"
        borderColor="rgba(255,255,255,0.2)"
        p={4}
        flexShrink={0}
      >
        {sidebarContent}
      </Flex>
    </>
  );
}
