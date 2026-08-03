"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  confirmMyTicket,
  fetchMyTicketById,
  fetchMyTickets,
  rejectMyTicket,
} from "../api/tickets.client";
import type { TicketListResponse } from "../types/ticket.types";

const TICKETS_KEY = ["my-tickets"] as const;

export function useMyTickets(page = 1, limit = 20) {
  return useQuery<TicketListResponse>({
    queryKey: [...TICKETS_KEY, page, limit] as const,
    queryFn: () => fetchMyTickets(page, limit),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
  });
}

export function useMyTicketById(ticketId: string) {
  return useQuery({
    queryKey: [...TICKETS_KEY, ticketId] as const,
    queryFn: () => fetchMyTicketById(ticketId),
    enabled: Boolean(ticketId),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
  });
}

export function useConfirmMyTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: string) => confirmMyTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKETS_KEY });
    },
  });
}

export function useRejectMyTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: string) => rejectMyTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKETS_KEY });
    },
  });
}
