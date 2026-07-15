"use client";

import { Box, Flex, HStack, IconButton, Skeleton, Text, VStack } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMe } from "@/features/users/hooks/useProfile";
import { PrivacyConsentModal } from "@/features/users/components/PrivacyConsentModal";
import { UserSidebar } from "@/features/users/components/UserSidebar";

const TITLES: Record<string, string> = {
  "/mi-cuenta": "Información personal",
  "/mi-cuenta/entradas": "Mis entradas",
  "/mi-cuenta/pagos": "Historial de pagos",
};

function DashboardHeader({
  title,
  onToggle,
  isOpen,
}: {
  title: string;
  onToggle: () => void;
  isOpen: boolean;
}) {
  return (
    <HStack
      hideFrom="md"
      justify="space-between"
      px={4}
      py={3}
      borderBottom="1px solid rgba(255,255,255,0.08)"
      bg="rgba(2,4,20,0.7)"
      backdropFilter="blur(12px)"
      position="sticky"
      top={0}
      zIndex={5}
    >
      <Text fontWeight="bold" color="white" fontSize="lg">
        {title}
      </Text>
      <IconButton
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        variant="ghost"
        color="white"
        size="sm"
        onClick={onToggle}
      >
        {isOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
      </IconButton>
    </HStack>
  );
}

export default function MiCuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isLoading: authLoading } = useAuth();
  const { data, isLoading: profileLoading } = useMe();
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Mi cuenta";

  if (authLoading || profileLoading) {
    return (
      <Flex flex={1} align="center" justify="center" p={6}>
        <Box w="full" maxW="md">
          <VStack gap={6} align="stretch">
            <Skeleton height="28px" width="120px" />
            <Skeleton height="40px" width="full" />
            <Skeleton height="40px" width="full" />
            <Skeleton height="40px" width="full" />
            <Skeleton height="36px" width="100px" />
          </VStack>
        </Box>
      </Flex>
    );
  }

  const needsConsent =
    data?.consentStatus?.required && !data?.consentStatus?.acceptedAt;

  if (needsConsent) {
    return <PrivacyConsentModal />;
  }

  return (
    <Flex flex={1} minH={0} position="relative">
      <UserSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        overflow="hidden"
        bg="brand.dark"
      >
        <DashboardHeader
          title={title}
          onToggle={() => setMobileOpen((v) => !v)}
          isOpen={mobileOpen}
        />

        <Box
          flex={1}
          overflowY="auto"
          px={{ base: 4, md: 6, lg: 8 }}
          py={{ base: 6, md: 8 }}
        >
          {children}
        </Box>
      </Box>
    </Flex>
  );
}
