export type EventSummary = {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  location: string | null;
  prefix: string | null;
};

export type EventsListResponse = {
  data: EventSummary[];
};

export async function fetchPublishedEvents(): Promise<EventSummary[]> {
  const res = await fetch("/api/events");

  if (!res.ok) {
    throw new Error(`Error al cargar eventos: ${res.status}`);
  }

  const body: EventsListResponse = await res.json();
  return body.data;
}
