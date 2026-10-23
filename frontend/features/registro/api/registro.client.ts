import { createClient } from "@/shared/lib/supabase/client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type RegisterInput = {
  name: string;
  cedula: string;
  email: string;
  phone: string;
  profesion: string;
};
export type RegisterRecord = RegisterInput & {
  isEgresado: boolean;
  confirmed: boolean;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const {
    data: { session },
  } = await createClient().auth.getSession();
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {}),
        ...init?.headers,
      },
      credentials: "include",
    });
  } catch {
    throw new Error(
      "No fue posible conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.",
    );
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    if (
      body?.error?.code === "CEDULA_ALREADY_REGISTERED" ||
      (path === "/api/register" && response.status === 409)
    ) {
      throw new Error("Esta cédula ya se encuentra registrada.");
    }

    if (response.status >= 500) {
      throw new Error(
        "Ocurrió un error al procesar la solicitud. Inténtalo de nuevo más tarde.",
      );
    }

    throw new Error(
      body?.error?.message ?? "No fue posible completar la solicitud.",
    );
  }

  return body;
}

export function submitRegistration(data: RegisterInput) {
  return request<{ success: boolean }>("/api/register", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function findRegistration(
  cedula: string,
): Promise<RegisterRecord | null> {
  const result = await request<{ data: RegisterRecord | null }>(
    `/api/admin/register/${encodeURIComponent(cedula)}`,
  );

  return result.data;
}

export async function confirmRegistration(cedula: string, confirmed: boolean) {
  return request(
    `/api/admin/register/${encodeURIComponent(cedula)}/confirmation`,
    { method: "PATCH", body: JSON.stringify({ confirmed }) },
  );
}
