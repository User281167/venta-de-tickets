"use client";

import { createClient } from "@/shared/lib/supabase/client";
import type { EpaycoCheckoutResponse, EpaycoSessionRequest, EpaycoStatusResponse } from "../types/epayco";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "Algunos campos no son válidos. Revisa la información ingresada.",
  MAX_PER_USER_EXCEEDED: "Has excedido el límite por usuario para uno o más tipos de entrada.",
  TICKET_TYPE_NOT_AVAILABLE: "Uno o más tipos de entrada ya no están disponibles.",
  TICKET_TYPE_EXPIRED: "La venta de una o más entradas ya cerró.",
  EGRESADO_ONLY: "Una o más entradas están reservadas para egresados.",
  SOLD_OUT: "Uno o más tipos de entrada están agotados.",
  USER_INFO_INCOMPLETE: "Completa tu perfil para continuar con el pago.",
  UNAUTHORIZED: "Tu sesión expiró. Inicia sesión nuevamente.",
  INTERNAL_ERROR: "No pudimos procesar el pago. Intenta de nuevo.",
};

async function getToken(): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) throw new Error("No autenticado");

  return token;
}

export async function createEpaycoSession(
  input: EpaycoSessionRequest,
): Promise<EpaycoCheckoutResponse> {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/api/payments/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: input.items,
      backUrl: input.backUrl,
      provider: "epayco",
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const code = body?.error?.code ?? "INTERNAL_ERROR";
    const message = ERROR_MESSAGES[code] ?? body?.error?.message ?? "Error inesperado";
    const error = new Error(message);
    (error as any).code = code;
    throw error;
  }

  return res.json();
}

export async function pollEpaycoStatus(
  paymentId: string,
  refPayco?: string,
): Promise<EpaycoStatusResponse> {
  const token = await getToken();

  const params = refPayco ? `?ref_payco=${encodeURIComponent(refPayco)}` : "";
  const res = await fetch(
    `${BASE_URL}/api/payments/epayco/status/${paymentId}${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }

  return res.json();
}
