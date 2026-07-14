export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type TicketSummary = {
  id: string;
  ticketCode: string;
  status: string;
};

export type PaymentItem = {
  id: string;
  provider: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
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
