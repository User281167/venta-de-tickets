export type TicketStatus =
  | "reserved"
  | "paid"
  | "pending_confirmation"
  | "confirmed"
  | "used"
  | "cancelled"
  | "expired";

export type TicketTypeInfo = {
  id: string;
  name: string;
};

export type TicketItem = {
  id: string;
  ticketCode: string;
  qrToken: string | null;
  status: TicketStatus;
  purchasedAt: string | null;
  createdAt: string;
  ticketType: TicketTypeInfo;
};

export type TicketListResponse = {
  data: TicketItem[];
  total: number;
  page: number;
  limit: number;
};
