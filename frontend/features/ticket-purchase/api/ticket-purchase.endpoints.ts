import type { TicketType } from "@/features/ticket-types/schemas/ticket-types.schema";

type ActiveTicketTypesResponse = {
  data: TicketType[];
};

export async function fetchActiveTicketTypes(): Promise<TicketType[]> {
  const res = await fetch("/api/ticket-types");

  if (!res.ok) {
    throw new Error(`Error al cargar entradas: ${res.status}`);
  }

  const body: ActiveTicketTypesResponse = await res.json();
  return body.data;
}
