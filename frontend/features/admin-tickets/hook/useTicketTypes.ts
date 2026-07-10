import { useState } from "react";
import {
  useAdminTicketTypes,
  useCreateTicketType,
  useUpdateTicketType,
  useDeactivateTicketType,
} from "@/features/ticket-types/api/ticket-types.queries";
import type { AdminTicketType } from "@/features/ticket-types/schemas/ticket-types.schema";

export function useTicketTable() {
  const { data: ticketTypes, isLoading: loadingTypes } = useAdminTicketTypes("");
  const createMutation = useCreateTicketType("");
  const updateMutation = useUpdateTicketType("");
  const deactivateMutation = useDeactivateTicketType("");

  const [editing, setEditing] = useState<AdminTicketType | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isLoading = loadingTypes;
  const ticketTypesList = ticketTypes ?? [];

  return {
    ticketTypes,
    isLoading,
    createMutation,
    updateMutation,
    deactivateMutation,
    editing,
    setEditing,
    showCreate,
    setShowCreate,
    deletingId,
    setDeletingId,
    ticketTypesList,
  };
}
