import { z } from "zod";

export const confirmTicketResponseSchema = z.object({
  success: z.literal(true),
  result: z.enum(["confirmed", "rejected"]),
});

export type ConfirmTicketResponse = z.infer<typeof confirmTicketResponseSchema>;
