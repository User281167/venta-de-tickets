import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { adminFetch } from "@/shared/api/admin-fetch";

export type SurveyAnswer = {
  question_id: string;
  answer: string | string[];
};

export type SurveyRow = {
  userId: string;
  name: string | null;
  email: string | null;
  answers: SurveyAnswer[];
  created_at: string | null;
};

export type SurveyListResponse = {
  data: SurveyRow[];
  total: number;
  page: number;
  limit: number;
};

async function fetchResponses(
  page: number,
  limit: number,
): Promise<SurveyListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return adminFetch<SurveyListResponse>(
    `/api/admin/surveys/onboarding?${params}`,
  );
}

export function useOnboardingResponses(page: number, limit: number) {
  return useQuery({
    queryKey: ["admin", "surveys", "onboarding", page, limit],
    queryFn: () => fetchResponses(page, limit),
    placeholderData: keepPreviousData,
  });
}
