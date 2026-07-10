"use client";

import { Flex } from "@chakra-ui/react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMe } from "@/features/users/hooks/useProfile";
import { PrivacyConsentModal } from "@/features/users/components/PrivacyConsentModal";
import { UserSidebar } from "@/features/users/components/UserSidebar";
import { Box, Skeleton, VStack } from "@chakra-ui/react";

export default function MiCuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading: authLoading } = useAuth();
  const { data, isLoading: profileLoading } = useMe();

  if (authLoading || profileLoading) {
    return (
      <Box maxW="md" mx="auto" mt={10} p={6}>
        <VStack gap={6} align="stretch">
          <Skeleton height="28px" width="120px" />
          <Skeleton height="40px" width="full" />
          <Skeleton height="40px" width="full" />
          <Skeleton height="40px" width="full" />
          <Skeleton height="36px" width="100px" />
        </VStack>
      </Box>
    );
  }

  const needsConsent =
    data?.consentStatus?.required && !data?.consentStatus?.acceptedAt;

  if (needsConsent) {
    return <PrivacyConsentModal />;
  }

  return (
    <Flex maxW="full" minH="80vh">
      <UserSidebar />
      <Box flex={1} p={6}>
        {children}
      </Box>
    </Flex>
  );
}
