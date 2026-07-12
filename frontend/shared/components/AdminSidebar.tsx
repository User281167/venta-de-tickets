"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Link as ChakraLink,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { signOut } from "@/features/admin-auth/api/admin-auth.client";
import {
  IconDashboard,
  IconLogout,
  IconMenu2,
  IconUpload,
  IconUsers,
  IconTicket,
  IconQrcode,
  IconX,
  IconHome,
} from "@tabler/icons-react";
import { useState, type ReactNode } from "react";

type SidebarLink = {
  readonly href: string;
  readonly label: string;
  readonly icon: ReactNode;
  readonly roles?: readonly string[];
};

const ALL_LINKS: SidebarLink[] = [
  { href: "/", label: "Home", icon: <IconHome size={20} /> },
  { href: "/admin", label: "Panel", icon: <IconDashboard size={20} /> },
  {
    href: "/admin/ticket-types",
    label: "Tipos de entrada",
    icon: <IconTicket size={20} />,
    roles: ["super_admin", "admin"] as const,
  },
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    icon: <IconUsers size={20} />,
    roles: ["super_admin", "admin"] as const,
  },
  {
    href: "/admin/usuarios/carga-masiva",
    label: "Carga masiva",
    icon: <IconUpload size={20} />,
    roles: ["super_admin", "admin"] as const,
  },
];

const FUTURE_LINKS = [{ label: "Check-in", disabled: true }] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleLinks = ALL_LINKS.filter(
    (link) => !link.roles || link.roles.includes(role ?? ""),
  );

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  function handleNav() {
    setMobileOpen(false);
  }

  const futureIcons: Record<string, ReactNode> = {
    Tickets: <IconTicket size={18} />,
    "Check-in": <IconQrcode size={18} />,
  };

  const sidebarContent = (
    <>
      <HStack gap={3} mb={8} px={2}>
        <IconDashboard size={24} color="teal" />
        <Text fontSize="xl" fontWeight="bold">
          Admin
        </Text>
      </HStack>

      <VStack align="stretch" gap={1} flex={1}>
        {visibleLinks.map((link) => {
          const isActive = pathname === link.href || (link.href === "/admin/usuarios" && pathname.startsWith("/admin/usuarios/"));

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

        {FUTURE_LINKS.length > 0 && (
          <>
            <Separator my={3} borderColor="gray.200" />
            {FUTURE_LINKS.map((link) => (
              <HStack
                key={link.label}
                px={4}
                py={2}
                borderRadius="md"
                color="gray.400"
                cursor="not-allowed"
                fontSize="sm"
                gap={3}
              >
                {futureIcons[link.label]}
                <Text fontStyle="italic">{link.label} (próximamente)</Text>
              </HStack>
            ))}
          </>
        )}
      </VStack>

      <Button
        variant="ghost"
        color="gray.500"
        _hover={{ bg: "gray.100", color: "red.500" }}
        onClick={handleLogout}
        w="full"
        justifyContent="flex-start"
        px={4}
        gap={3}
      >
        <IconLogout size={20} />
        Cerrar sesión
      </Button>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <IconButton
        aria-label="Menú"
        variant="ghost"
        size="md"
        hideFrom="md"
        position="fixed"
        border="1px solid"
        borderColor="white"
        top={4}
        right={4}
        zIndex={1100}
        bg="white"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
      </IconButton>

      {/* Mobile overlay */}
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

      {/* Mobile sidebar drawer */}
      <Flex
        hideFrom="md"
        direction="column"
        position="fixed"
        top={0}
        left={0}
        bottom={0}
        w="72"
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

      {/* Desktop sidebar */}
      <Flex
        hideBelow="md"
        direction="column"
        w="64"
        minH="100vh"
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
