"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createDonation,
  getDonationStatus,
} from "../api/donaciones.client";
import type { CreateDonationInput } from "../api/donaciones.client";

export function useCreateDonation() {
  return useMutation({
    mutationFn: (data: CreateDonationInput) => createDonation(data),
  });
}

export function useDonationStatus(externalReference: string | null) {
  return useQuery({
    queryKey: ["donation-status", externalReference],
    queryFn: () => getDonationStatus(externalReference!),
    enabled: !!externalReference,
    refetchInterval: (query) =>
      query.state.data?.state === "pending" ? 3000 : false,
  });
}