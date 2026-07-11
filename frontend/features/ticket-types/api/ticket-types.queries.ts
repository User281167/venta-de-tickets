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

export function useAdminTicketTypes() {
  return useQuery({
    queryKey: ["admin", "ticket-types"],
    queryFn: () => fetchAdminTicketTypes(),
  });
}

export function useCreateTicketType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketTypeInput) =>
      createAdminTicketType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "ticket-types"],
      });
    },
  });
}

export function useUpdateTicketType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketTypeInput }) =>
      updateAdminTicketType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "ticket-types"],
      });
    },
  });
}

export function useDeactivateTicketType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateAdminTicketType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "ticket-types"],
      });
    },
  });
}
