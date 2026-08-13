import { createClient } from "@/shared/lib/supabase/client";
import type { UpdateUserInput } from "../schemas/users.schema";
import type {
  AcceptPoliciesResponse,
  PolicyContent,
  PolicyType,
} from "../types/policy.types";
import { GetMeResponse } from "../types/user.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR:
    "Algunos campos no son válidos. Revisa la información ingresada.",
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

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
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
    const msg =
      ERROR_MESSAGES[code] ?? body?.error?.message ?? `Error ${res.status}`;

    throw new ApiError(code, msg);
  }

  return res.json();
}

export function fetchMe(): Promise<GetMeResponse> {
  return apiFetch<GetMeResponse>("/api/me");
}

export function updateMe(data: UpdateUserInput): Promise<{
  cedula: string | null;
  fullName: string | null;
  phone: string | null;
  address: string | null;
  dateOfBirth: string | null;
}> {
  return apiFetch("/api/me/personal-info", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function acceptPolicies(
  types: PolicyType[],
): Promise<AcceptPoliciesResponse> {
  return apiFetch<AcceptPoliciesResponse>("/api/users/me/policy-acceptance", {
    method: "POST",
    body: JSON.stringify({ types }),
  });
}

export async function fetchPolicyContent(
  type: PolicyType,
): Promise<PolicyContent> {
  const res = await fetch(`${BASE_URL}/api/users/policies/${type}`);

  if (!res.ok) {
    throw new ApiError(
      "INTERNAL_ERROR",
      "No se pudo cargar el contenido de la política.",
    );
  }

  return res.json() as Promise<PolicyContent>;
}
