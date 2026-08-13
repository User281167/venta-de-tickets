import { DonationAccount } from "@/shared/utils/donation-status";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

async function publicFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const code = body?.error?.code ?? "INTERNAL_ERROR";
    const msg = body?.error?.message ?? `Error ${res.status}`;
    throw new ApiError(code, msg);
  }

  return res.json();
}

export type CreateDonationInput = {
  fullName?: string | null;
  email?: string | null;
  amountCents: number;
  account: DonationAccount;
  backUrl: string;
  provider?: string;
};

export type CreateDonationResponse = {
  initPoint: string;
  sessionId?: string;
};

export type DonationStatusResponse = {
  state: string;
  account: string;
  amountCents: number;
  createdAt: string;
};

export function createDonation(
  data: CreateDonationInput,
): Promise<CreateDonationResponse> {
  return publicFetch<CreateDonationResponse>("/api/donaciones", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getDonationStatus(
  externalReference: string,
): Promise<DonationStatusResponse> {
  return publicFetch<DonationStatusResponse>(
    `/api/donaciones/${externalReference}/status`,
  );
}
