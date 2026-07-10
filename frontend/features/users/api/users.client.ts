import { createClient } from "@/shared/lib/supabase/client";
import type { UpdateUserInput } from "../schemas/users.schema";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "Algunos campos no son válidos. Revisa la información ingresada.",
  CEDULA_INVALIDATION: "La cédula ya fue registrada y no puede modificarse.",
  INTERNAL_ERROR: "Ocurrió un error inesperado. Intenta de nuevo más tarde.",
  UNAUTHORIZED: "Tu sesión expiró. Inicia sesión nuevamente.",
};

export class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

async function getToken(): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new ApiError("UNAUTHORIZED", "No autenticado");
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
    const code = body?.error?.code ?? "INTERNAL_ERROR";
    const msg = ERROR_MESSAGES[code] ?? body?.error?.message ?? `Error ${res.status}`;
    throw new ApiError(code, msg);
  }

  return res.json();
}

export type GetMeResponse = {
  user: {
    id: string;
    email: string;
    role: string | null;
    fullName: string | null;
    phone: string | null;
    cedula: string | null;
    address: string | null;
    dateOfBirth: string | null;
  };
  consentStatus: {
    required: boolean;
    acceptedAt: string | null;
    policyVersion: string;
  };
};

export type AcceptPrivacyResponse = {
  status: string;
  acceptedAt: string;
  policyVersion: string;
};

export function fetchMe(): Promise<GetMeResponse> {
  return apiFetch<GetMeResponse>("/api/me");
}

export function updateMe(
  data: UpdateUserInput,
): Promise<{ cedula: string | null; fullName: string | null; phone: string | null; address: string | null; dateOfBirth: string | null }> {
  return apiFetch("/api/me/personal-info", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function acceptPrivacy(): Promise<AcceptPrivacyResponse> {
  return apiFetch("/api/users/me/privacy-acceptance", {
    method: "POST",
  });
}
