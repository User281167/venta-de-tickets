import { apiFetch } from "./users.client";
import type { TicketListResponse } from "../types/ticket.types";

export function fetchMyTickets(
  page = 1,
  limit = 20,
): Promise<TicketListResponse> {
  return apiFetch<TicketListResponse>(
    `/api/me/tickets?page=${page}&limit=${limit}`,
  );
}
