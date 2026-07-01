import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/shared/api/admin-fetch";

export type SurveyResponse = {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  answers: Record<string, unknown>;
  submittedAt: string;
};

export type SurveyListResponse = {
  data: SurveyResponse[];
};

export function useSurveys() {
  return useQuery({
    queryKey: ["admin", "surveys", "onboarding"],
    queryFn: () => adminFetch<SurveyListResponse>("/api/admin/surveys/onboarding"),
  });
}
