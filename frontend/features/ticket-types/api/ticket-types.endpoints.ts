import { adminFetch } from "@/shared/api/admin-fetch";
import type { EventWithTicketTypes, AdminTicketType, CreateTicketTypeInput, UpdateTicketTypeInput } from "../schemas/ticket-types.schema";

export async function fetchEventWithTicketTypes(
  eventId: string,
): Promise<EventWithTicketTypes> {
  const res = await fetch(`/api/events/${eventId}`);

  if (!res.ok) {
    if (res.status === 404) throw new Error("Evento no encontrado");
    throw new Error(`Error al cargar evento: ${res.status}`);
  }

  return res.json();
}

export async function fetchAdminTicketTypes(
  eventId: string,
): Promise<AdminTicketType[]> {
  const body = await adminFetch<{ data: AdminTicketType[] }>(
    `/api/admin/${eventId}/ticket-types`,
  );

  return body.data;
}

export async function createAdminTicketType(
  eventId: string,
  data: CreateTicketTypeInput,
): Promise<AdminTicketType> {
  return adminFetch<AdminTicketType>(
    `/api/admin/${eventId}/ticket-types`,
    { method: "POST", body: JSON.stringify(data) },
  );
}

export async function updateAdminTicketType(
  id: string,
  data: UpdateTicketTypeInput,
): Promise<AdminTicketType> {
  return adminFetch<AdminTicketType>(
    `/api/admin/ticket-types/${id}`,
    { method: "PATCH", body: JSON.stringify(data) },
  );
}

export async function deactivateAdminTicketType(
  id: string,
): Promise<void> {
  await adminFetch<void>(
    `/api/admin/ticket-types/${id}`,
    { method: "DELETE" },
  );
}
