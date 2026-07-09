export type TicketTypeStatus = 'enabled' | 'disabled' | 'blocked';

export interface TicketTypeDTO {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantityTotal: number;
  quantitySold: number;
  maxPerUser: number | null;
  saleEndsAt: string | null;
  status: TicketTypeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTicketInput {
  name: string;
  description?: string;
  price: number;
  quantityTotal: number;
  maxPerUser?: number;
  saleEndsAt?: string;
}

export interface UpdateTicketInput {
  name?: string;
  description?: string | null;
  price?: number;
  quantityTotal?: number;
  maxPerUser?: number | null;
  saleEndsAt?: string | null;
  status?: TicketTypeStatus;
}
