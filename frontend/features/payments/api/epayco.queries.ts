"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { createEpaycoSession, pollEpaycoStatus } from "./epayco";
import type { EpaycoSessionRequest } from "../types/epayco";

export function useCreateEpaycoCheckout() {
  return useMutation({
    mutationFn: (input: EpaycoSessionRequest) => createEpaycoSession(input),
  });
}

export function useEpaycoStatus(paymentId: string | null, refPayco?: string) {
  return useQuery({
    queryKey: ["epayco-status", paymentId, refPayco],
    queryFn: () => pollEpaycoStatus(paymentId!, refPayco),
    enabled: !!paymentId,
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 2000 : false,
    gcTime: 1000 * 60,
  });
}
