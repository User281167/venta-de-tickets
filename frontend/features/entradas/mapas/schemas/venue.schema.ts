import { z } from "zod";

export const venueTicketTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  quantityTotal: z.number(),
  quantitySold: z.number(),
  status: z.enum(["enabled", "disabled", "blocked"]),
  onlyEgresados: z.boolean(),
});

export type VenueTicketType = z.infer<typeof venueTicketTypeSchema>;
  