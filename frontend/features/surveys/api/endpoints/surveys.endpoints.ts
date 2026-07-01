import { createClient } from "@/shared/lib/supabase/client";
import type {
  OnboardingSurveyInput,
  SubmitOnboardingSurveyResponse,
} from "../schemas/surveys.schema";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function getToken(): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new Error("No autenticado");
  }

  return token;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? `Error ${res.status}`);
  }

  return res.json();
}

export async function submitOnboardingSurvey(
  data: OnboardingSurveyInput,
): Promise<SubmitOnboardingSurveyResponse> {
  return apiFetch<SubmitOnboardingSurveyResponse>("/api/surveys/onboarding", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
