"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitOnboardingSurvey } from "./endpoints/surveys.endpoints";
import type { OnboardingSurveyInput } from "./schemas/surveys.schema";

const ME_KEY = ["me"] as const;

export function useSubmitOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OnboardingSurveyInput) => submitOnboardingSurvey(data),
    onSuccess: () => {
      // Invalidar la consulta me para actualizar el indicador onboarding_survey_done
      queryClient.invalidateQueries({ queryKey: ME_KEY });
    },
  });
}
