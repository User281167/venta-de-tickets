import { z } from "zod";

export const checkerActionSchema = z.enum([
  "confirm_entry_direct",
  "request_confirmation",
  "allow_entry",
]);

export const ticketStatusSchema = z.enum([
  "paid",
  "pending_confirmation",
  "confirmed",
  "used",
  "reserved",
  "cancelled",
  "expired",
]);

export const scanResponseSchema = z.object({
  ticketId: z.string().uuid(),
  status: ticketStatusSchema,
  attendeeName: z.string(),
  attendeeCedula: z.string().nullable(),
  ticketTypeName: z.string(),
  checkedInAt: z.string().nullable(),
  allowedActions: z.array(checkerActionSchema),
});

export const ticketActionInputSchema = z.object({
  ticketId: z.string().uuid(),
});

export const scanInputSchema = z.object({
  qrToken: z.string().min(1),
});

export type CheckerAction = z.infer<typeof checkerActionSchema>;
export type TicketStatus = z.infer<typeof ticketStatusSchema>;
export type TicketSummary = z.infer<typeof scanResponseSchema>;
export type TicketActionInput = z.infer<typeof ticketActionInputSchema>;
export type ScanInput = z.infer<typeof scanInputSchema>;
