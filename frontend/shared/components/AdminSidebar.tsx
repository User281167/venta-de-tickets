"use client";

import {
  Box,
  Button,
  Flex,
  Link as ChakraLink,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { signOut } from "@/features/admin-auth/api/admin-auth.client";

const ALL_LINKS = [
  { href: "/admin", label: "Panel" },
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    roles: ["super_admin", "organizer"],
  },
  {
    href: "/admin/encuestas",
    label: "Encuestas",
    roles: ["super_admin", "organizer"],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useAuth();

  const visibleLinks = ALL_LINKS.filter(
    (link) => !link.roles || link.roles.includes(role ?? ""),
  );

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  return (
    <Flex
      direction="column"
      w="64"
      minH="100vh"
      bg="gray.900"
      color="white"
      p={4}
    >
      <Text fontSize="xl" fontWeight="bold" mb={8}>
        Admin
      </Text>

      <VStack align="stretch" gap={2} flex={1}>
        {visibleLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <ChakraLink
              asChild
              key={link.href}
              display="block"
              px={4}
              py={2}
              borderRadius="md"
              bg={isActive ? "teal.600" : "transparent"}
              _hover={{ bg: isActive ? "teal.600" : "gray.700" }}
              transition="background 0.2s"
            >
              <NextLink href={link.href}>{link.label}</NextLink>
            </ChakraLink>
          );
        })}
      </VStack>

      <Button
        variant="outline"
        colorScheme="red"
        color="red.300"
        borderColor="red.800"
        onClick={handleLogout}
        w="full"
      >
        Cerrar sesión
      </Button>
    </Flex>
  );
}
