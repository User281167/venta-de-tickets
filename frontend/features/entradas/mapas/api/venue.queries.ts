"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchVenueTicketTypes } from "./venue.endpoints";

export function useVenueTicketTypes() {
  return useQuery({
    queryKey: ["venue-ticket-types"],
    queryFn: fetchVenueTicketTypes,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
