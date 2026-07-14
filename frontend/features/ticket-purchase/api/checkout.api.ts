"use client";

import { createClient } from "@/shared/lib/supabase/client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type CheckoutItem = {
  ticketTypeId: string;
  quantity: number;
};

export type CheckoutResponse = {
  paymentId: string;
  checkoutUrl: string;
  preferenceId: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "Algunos campos no son válidos. Revisa la información ingresada.",
  MAX_PER_USER_EXCEEDED: "Has excedido el límite por usuario para uno o más tipos de entrada.",
  TICKET_TYPE_NOT_AVAILABLE: "Uno o más tipos de entrada ya no están disponibles.",
  SOLD_OUT: "Uno o más tipos de entrada están agotados.",
  UNAUTHORIZED: "Tu sesión expiró. Inicia sesión nuevamente.",
};

export class CheckoutError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "CheckoutError";
    this.code = code;
  }
}

async function getToken(): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new CheckoutError("UNAUTHORIZED", "No autenticado");
  }

  return token;
}

export async function createCheckoutPreference(
  items: CheckoutItem[],
  backUrl: string,
): Promise<CheckoutResponse> {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/api/payments/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items,
      backUrl,
      provider: "mercadopago",
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const code = body?.error?.code ?? "INTERNAL_ERROR";
    const msg = ERROR_MESSAGES[code] ?? body?.error?.message ?? `Error ${res.status}`;
    throw new CheckoutError(code, msg);
  }

  return res.json();
}
