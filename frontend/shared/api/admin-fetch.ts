import { createClient } from "@/shared/lib/supabase/client";
import { ApiError } from "./api-error";

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

export async function authFetch<T>(path: string, options?: RequestInit): Promise<T> {
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
    if (res.status === 401 || res.status === 403) {
      throw new ApiError(res.status, "No autorizado", "UNAUTHORIZED");
    }

    let code: string | undefined;
    let data: { emails?: string[]; cedulas?: string[] } | undefined;
    try {
      const body = (await res.json()) as {
        error?: { code?: string; message?: string; data?: { emails?: string[]; cedulas?: string[] } };
      };
      code = body?.error?.code;
      data = body?.error?.data;
    } catch {
      /* response body not JSON — use defaults */
    }

    throw new ApiError(res.status, `Error ${res.status}`, code, data);
  }

  return res.json() as Promise<T>;
}
