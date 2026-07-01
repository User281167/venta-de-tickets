import { useQuery } from "@tanstack/react-query";

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

async function fetchSurveys(): Promise<SurveyListResponse> {
  const res = await fetch("/api/admin/surveys/onboarding", {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error("forbidden");
    }
    throw new Error("Failed to fetch survey responses");
  }

  return res.json();
}

export function useSurveys() {
  return useQuery({
    queryKey: ["admin", "surveys", "onboarding"],
    queryFn: fetchSurveys,
  });
}
