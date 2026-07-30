"use client";

import { createClient } from "@/shared/lib/supabase/client";
import type { EpaycoCheckoutResponse, EpaycoSessionRequest, EpaycoStatusResponse } from "../types/epayco";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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
    const error = new Error(body?.error?.message ?? `Error ${res.status}`);
    (error as any).code = body?.error?.code;
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
