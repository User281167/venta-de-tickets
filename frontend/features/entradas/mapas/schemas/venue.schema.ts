import { z } from "zod";

export const venueZonaSchema = z.enum(["vip", "plata", "bronce"]);

export const venueTicketTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  quantityTotal: z.number(),
  quantitySold: z.number(),
  status: z.enum(["enabled", "disabled", "blocked"]),
  onlyEgresados: z.boolean(),
  zona: venueZonaSchema.nullable(),
});

export type VenueTicketType = z.infer<typeof venueTicketTypeSchema>;
export type VenueZona = z.infer<typeof venueZonaSchema>;
  