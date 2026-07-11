import { authFetch } from "@/shared/api/admin-fetch";
import type {
  EventWithTicketTypes,
  AdminTicketType,
  CreateTicketTypeInput,
  UpdateTicketTypeInput,
} from "../schemas/ticket-types.schema";

export async function fetchAdminTicketTypes(
  eventId: string,
): Promise<AdminTicketType[]> {
  const body = await authFetch<{ data: AdminTicketType[] }>(
    `/api/admin/${eventId}/ticket-types`,
  );

  return body.data;
}

export async function createAdminTicketType(
  eventId: string,
  data: CreateTicketTypeInput,
): Promise<AdminTicketType> {
  return authFetch<AdminTicketType>(`/api/admin/${eventId}/ticket-types`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAdminTicketType(
  id: string,
  data: UpdateTicketTypeInput,
): Promise<AdminTicketType> {
  return authFetch<AdminTicketType>(`/api/admin/ticket-types/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deactivateAdminTicketType(id: string): Promise<void> {
  await authFetch<void>(`/api/admin/ticket-types/${id}`, { method: "DELETE" });
}
