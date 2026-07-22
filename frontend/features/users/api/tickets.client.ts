import { apiFetch } from "./users.client";
import { confirmTicketResponseSchema } from "../schemas/ticket.schema";
import type { ConfirmTicketResponse } from "../schemas/ticket.schema";
import { ticketItemSchema } from "../schemas/ticket.schema";
import type { TicketListResponse } from "../types/ticket.types";

export function fetchMyTickets(
  page = 1,
  limit = 20,
): Promise<TicketListResponse> {
  return apiFetch<TicketListResponse>(
    `/api/me/tickets?page=${page}&limit=${limit}`,
  );
}

export function fetchMyTicketById(ticketId: string) {
  return apiFetch(`/api/me/tickets/${ticketId}`).then((raw) =>
    ticketItemSchema.parse(raw),
  );
}

export async function confirmMyTicket(
  ticketId: string,
): Promise<ConfirmTicketResponse> {
  const raw = await apiFetch<ConfirmTicketResponse>(
    `/api/me/tickets/${ticketId}/confirm`,
    { method: "POST" },
  );

  return confirmTicketResponseSchema.parse(raw);
}

export async function rejectMyTicket(
  ticketId: string,
): Promise<ConfirmTicketResponse> {
  const raw = await apiFetch<ConfirmTicketResponse>(
    `/api/me/tickets/${ticketId}/reject`,
    { method: "POST" },
  );

  return confirmTicketResponseSchema.parse(raw);
}
