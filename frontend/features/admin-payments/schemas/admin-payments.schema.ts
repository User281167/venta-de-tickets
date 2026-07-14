import { z } from "zod";

export const paymentFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
});

export type PaymentFilters = z.infer<typeof paymentFiltersSchema>;

export const refundFormSchema = z.object({
  reason: z
    .string()
    .min(10, "La razón debe tener al menos 10 caracteres")
    .max(500, "La razón no puede exceder 500 caracteres"),
});

export type RefundFormData = z.infer<typeof refundFormSchema>;

export interface PaymentListRow {
  id: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  status: string;
  provider: string;
  providerTxId: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  ticketCount: number;
}

export interface PaymentListResponse {
  data: PaymentListRow[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentDetailResponse {
  id: string;
  userId: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  status: string;
  provider: string;
  providerTxId: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  tickets: Array<{
    id: string;
    ticketCode: string;
    status: string;
    unitPriceCents: number;
    ticketType: {
      id: string;
      name: string;
      price: number;
    };
  }>;
}

export interface CreateAdminPaymentTicket {
  ticketTypeId: string;
  quantity: number;
}

export interface CreateAdminPaymentInput {
  userId: string;
  provider: "MANUAL" | "GIFT";
  tickets: CreateAdminPaymentTicket[];
}

export interface CreateAdminPaymentResponse {
  paymentId: string;
  provider: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  status: string;
  createdBy: string;
  ticketIds: string[];
}
