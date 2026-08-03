import { venueTicketTypeSchema, type VenueTicketType } from "../schemas/venue.schema";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type BackendTicketType = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number | string;
  quantityTotal: number | string;
  quantitySold: number | string;
  maxPerUser: number | null;
  saleEndsAt: string | null;
  status: string;
  onlyEgresados: boolean;
  zona: string | null;
};

type BackendResponse = {
  data: BackendTicketType[];
  total: number;
  page: number;
  limit: number;
};

export async function fetchVenueTicketTypes(): Promise<VenueTicketType[]> {
  const res = await fetch(`${BASE_URL}/api/tickets?page=1&limit=50`);

  if (!res.ok) {
    throw new Error(`Error al cargar entradas: ${res.status}`);
  }

  const body: BackendResponse = await res.json();

  return body.data.map((tt) =>
    venueTicketTypeSchema.parse({
      id: tt.id,
      name: tt.name,
      description: tt.description,
      priceCents: Number(tt.priceCents),
      quantityTotal: Number(tt.quantityTotal),
      quantitySold: Number(tt.quantitySold),
      status: tt.status,
      onlyEgresados: tt.onlyEgresados,
      zona: tt.zona,
    }),
  );
}
