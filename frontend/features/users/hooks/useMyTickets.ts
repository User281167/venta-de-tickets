"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMyTickets } from "../api/tickets.client";

const TICKETS_KEY = ["my-tickets"] as const;

export function useMyTickets(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...TICKETS_KEY, page, limit] as const,
    queryFn: () => fetchMyTickets(page, limit),
  });
}
