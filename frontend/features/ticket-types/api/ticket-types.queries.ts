"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminTicketTypes,
  createAdminTicketType,
  updateAdminTicketType,
  deactivateAdminTicketType,
} from "./ticket-types.endpoints";
import type {
  CreateTicketTypeInput,
  UpdateTicketTypeInput,
} from "../schemas/ticket-types.schema";

export function useAdminTicketTypes(eventId: string) {
  return useQuery({
    queryKey: ["admin", "ticket-types", eventId],
    queryFn: () => fetchAdminTicketTypes(eventId),
    enabled: !!eventId,
  });
}

export function useCreateTicketType(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketTypeInput) =>
      createAdminTicketType(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "ticket-types", eventId],
      });
    },
  });
}

export function useUpdateTicketType(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketTypeInput }) =>
      updateAdminTicketType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "ticket-types", eventId],
      });
    },
  });
}

export function useDeactivateTicketType(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateAdminTicketType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "ticket-types", eventId],
      });
    },
  });
}
