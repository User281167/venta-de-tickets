import type { TicketType } from "@/features/ticket-types/schemas/ticket-types.schema";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type BackendTicketType = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantityTotal: number;
  quantitySold: number;
  maxPerUser: number | null;
  saleEndsAt: string | null;
  status: string;
};

type BackendResponse = {
  data: BackendTicketType[];
  total: number;
  page: number;
  limit: number;
};

export async function fetchActiveTicketTypes(): Promise<TicketType[]> {
  const res = await fetch(`${BASE_URL}/api/tickets?page=1&limit=50`);

  if (!res.ok) {
    throw new Error(`Error al cargar entradas: ${res.status}`);
  }

  const body: BackendResponse = await res.json();

  return body.data.map((tt) => ({
    id: tt.id,
    name: tt.name,
    description: tt.description,
    price: tt.price,
    availableCount: tt.quantityTotal - tt.quantitySold,
    maxPerUser: tt.maxPerUser,
    saleEndsAt: tt.saleEndsAt,
    isSoldOut: tt.quantitySold >= tt.quantityTotal,
    isActive: tt.status === "enabled",
  }));
}
