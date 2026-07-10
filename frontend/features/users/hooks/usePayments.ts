"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMyPayments } from "../api/payments.client";

const PAYMENTS_KEY = ["my-payments"] as const;

export function useMyPayments(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, page, limit] as const,
    queryFn: () => fetchMyPayments(page, limit),
  });
}
