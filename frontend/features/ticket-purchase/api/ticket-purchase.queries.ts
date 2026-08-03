"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchActiveTicketTypes } from "./ticket-purchase.endpoints";

export function useActiveTicketTypes() {
  return useQuery({
    queryKey: ["active-ticket-types"],
    queryFn: fetchActiveTicketTypes,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
