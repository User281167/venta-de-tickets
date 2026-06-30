"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { PrivacyConsentModal } from "@/features/users/components/PrivacyConsentModal";
import { ProfileForm } from "@/features/users/components/ProfileForm";
import { useMe } from "@/features/users/hooks/useProfile";
import { Box, Skeleton, VStack } from "@chakra-ui/react";

export default function MiCuentaPage() {
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
    data?.consentStatus.required && !data?.consentStatus.acceptedAt;

  if (needsConsent) {
    return <PrivacyConsentModal />;
  }

  return <ProfileForm />;
}
