import { useState } from "react";
import { usePublishedEvents } from "@/features/events/api/events.queries";
import {
  useAdminTicketTypes,
  useCreateTicketType,
  useUpdateTicketType,
  useDeactivateTicketType,
} from "@/features/ticket-types/api/ticket-types.queries";
import type { AdminTicketType } from "@/features/ticket-types/schemas/ticket-types.schema";

export function useTicketTable() {
  const { data: events, isLoading: loadingEvents } = usePublishedEvents();
  const eventId = events?.[0]?.id ?? "";
  const { data: ticketTypes, isLoading: loadingTypes } =
    useAdminTicketTypes(eventId);
  const createMutation = useCreateTicketType(eventId);
  const updateMutation = useUpdateTicketType(eventId);
  const deactivateMutation = useDeactivateTicketType(eventId);

  const [editing, setEditing] = useState<AdminTicketType | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isLoading = loadingEvents || loadingTypes;
  const ticketTypesList = ticketTypes ?? [];

  return {
    events,
    eventId,
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
