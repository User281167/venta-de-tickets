"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDonationCounter } from "@/features/donaciones/api/donation-counter.queries";
import { subscribeToDonationCounter } from "../api/donation-counter-realtime.client";

export function useDonationCounterRealtime() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["donation", "counter"],
    queryFn: fetchDonationCounter,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    return subscribeToDonationCounter((counter) => {
      queryClient.setQueryData(["donation", "counter"], counter);
    });
  }, [queryClient]);

  return query;
}
