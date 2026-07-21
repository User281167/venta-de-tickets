import { authFetch } from "@/shared/api/admin-fetch";
import { ApiError } from "@/shared/api/api-error";
import {
  scanInputSchema,
  scanResponseSchema,
  type ScanInput,
  type TicketActionInput,
  type TicketSummary,
} from "../schemas/checkin.schema";

const SCAN_PATH = "/internal/checkin/scan";
const CONFIRM_ENTRY_PATH = "/internal/checkin/confirm-entry";
const REQUEST_CONFIRMATION_PATH = "/internal/checkin/request-confirmation";
const ALLOW_ENTRY_PATH = "/internal/checkin/allow-entry";

async function authFetchWithMessage<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  try {
    return await authFetch<T>(path, options);
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    const message = err instanceof Error ? err.message : "Error desconocido";
    throw new ApiError(0, message, "NETWORK_ERROR");
  }
}

export async function scanQr(input: ScanInput): Promise<TicketSummary> {
  const parsed = scanInputSchema.parse(input);

  const result = await authFetchWithMessage<unknown>(SCAN_PATH, {
    method: "POST",
    body: JSON.stringify(parsed),
  });

  return scanResponseSchema.parse(result);
}

export async function confirmEntry(input: TicketActionInput): Promise<void> {
  await authFetchWithMessage<{ success: true }>(CONFIRM_ENTRY_PATH, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function requestConfirmation(
  input: TicketActionInput,
): Promise<void> {
  await authFetchWithMessage<{ success: true }>(REQUEST_CONFIRMATION_PATH, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function allowEntry(input: TicketActionInput): Promise<void> {
  await authFetchWithMessage<{ success: true }>(ALLOW_ENTRY_PATH, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
