"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { PrivacyConsentModal } from "@/features/users/components/PrivacyConsentModal";
import { ProfileForm } from "@/features/users/components/ProfileForm";
import { useMe } from "@/features/users/hooks/useProfile";
import { Text } from "@chakra-ui/react";

export default function MiCuentaPage() {
  const { isLoading: authLoading } = useAuth();
  const { data, isLoading: profileLoading } = useMe();

  if (authLoading || profileLoading) {
    return (
      <Text textAlign="center" mt={10}>
        Cargando...
      </Text>
    );
  }

  const needsConsent =
    data?.consentStatus.required && !data?.consentStatus.acceptedAt;

  if (needsConsent) {
    return <PrivacyConsentModal />;
  }

  return <ProfileForm />;
}
