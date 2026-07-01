"use client";

import { Box, Button, HStack, Text } from "@chakra-ui/react";
import { IconPlayerSkipForward } from "@tabler/icons-react";
import { useSubmitOnboarding } from "../api/surveys.queries";
import { toaster } from "@/components/ui/toaster";

type SurveySkipButtonProps = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  size?: "sm" | "md" | "lg";
};

export function SurveySkipButton({
  onSuccess,
  onError,
  size = "md",
}: SurveySkipButtonProps) {
  const submitMutation = useSubmitOnboarding();

  const handleSkip = async () => {
    try {
      await submitMutation.mutateAsync({ responses: [] });
      toaster.create({
        title: "Encuesta omitida",
        description: "Puedes completarla después desde tu perfil.",
        type: "success",
      });
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <Button
      onClick={handleSkip}
      loading={submitMutation.isPending}
      variant="outline"
      colorPalette="gray"
      size={size}
      borderRadius="lg"
      _hover={{
        bg: "gray.50",
        transform: "translateY(-1px)",
        boxShadow: "sm",
      }}
    >
      <HStack gap={2}>
        <IconPlayerSkipForward size={16} />
        <Text>Omitir encuesta</Text>
      </HStack>
    </Button>
  );
}
