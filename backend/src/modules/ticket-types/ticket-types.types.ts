export interface TicketTypeResponse {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantityTotal: number;
  quantitySold: number;
  maxPerUser: number | null;
  isActive: boolean;
  saleEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketTypeWithAvailability {
  id: string;
  name: string;
  description: string | null;
  price: number;
  availableCount: number;
  maxPerUser: number | null;
  isSoldOut: boolean;
}
