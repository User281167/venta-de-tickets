import { apiFetch } from "./users.client";
import type { PaymentListResponse } from "../types/payment.types";

export function fetchMyPayments(
  page = 1,
  limit = 20,
): Promise<PaymentListResponse> {
  return apiFetch<PaymentListResponse>(
    `/api/me/payments?page=${page}&limit=${limit}`,
  );
}
