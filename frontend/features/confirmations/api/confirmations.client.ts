const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

import {
  confirmTicketResponseSchema,
  type ConfirmTicketResponse,
} from "../schemas/confirmation.schema";

class ConfirmationApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "ConfirmationApiError";
    this.code = code;
  }
}

async function postConfirmation(
  path: "/confirm" | "/reject",
  token: string,
): Promise<ConfirmTicketResponse> {
  const res = await fetch(`${BASE_URL}/api/confirmations${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const code = body?.error?.code ?? "INTERNAL_ERROR";
    const message = body?.error?.message ?? `Error ${res.status}`;
    throw new ConfirmationApiError(code, message);
  }

  return confirmTicketResponseSchema.parse(await res.json());
}

export function confirmByToken(token: string): Promise<ConfirmTicketResponse> {
  return postConfirmation("/confirm", token);
}

export function rejectByToken(token: string): Promise<ConfirmTicketResponse> {
  return postConfirmation("/reject", token);
}
