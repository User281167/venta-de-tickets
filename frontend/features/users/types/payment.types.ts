export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type TicketSummary = {
  id: string;
  ticketCode: string;
  status: string;
};

export type PaymentItem = {
  id: string;
  provider: string;
  amountCents: number;
  status: PaymentStatus;
  createdAt: string;
  tickets: TicketSummary[];
};

export type PaymentListResponse = {
  data: PaymentItem[];
  total: number;
  page: number;
  limit: number;
};
