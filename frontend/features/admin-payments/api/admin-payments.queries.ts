import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { authFetch } from "@/shared/api/admin-fetch";
import type {
  PaymentListResponse,
  PaymentFilters,
  PaymentDetailResponse,
  RefundFormData,
} from "../schemas/admin-payments.schema";

async function fetchPayments(
  filters: PaymentFilters,
): Promise<PaymentListResponse> {
  const params = new URLSearchParams();
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));

  if (filters.status) params.set("status", filters.status);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.search) params.set("search", filters.search);

  return authFetch<PaymentListResponse>(
    `/api/admin/payments?${params.toString()}`,
  );
}

export function usePayments(filters: PaymentFilters) {
  return useQuery({
    queryKey: ["admin", "payments", filters],
    queryFn: () => fetchPayments(filters),
    placeholderData: keepPreviousData,
  });
}

async function fetchPaymentDetail(id: string): Promise<PaymentDetailResponse> {
  return authFetch<PaymentDetailResponse>(`/api/admin/payments/${id}`);
}

export function usePaymentDetail(id: string) {
  return useQuery({
    queryKey: ["admin", "payments", id],
    queryFn: () => fetchPaymentDetail(id),
    enabled: !!id,
  });
}

async function processRefund(
  paymentId: string,
  data: RefundFormData,
): Promise<{ paymentId: string; status: string }> {
  return authFetch<{ paymentId: string; status: string }>(
    `/api/admin/payments/${paymentId}/refund`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: data.reason }),
    },
  );
}

export function useProcessRefund(paymentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RefundFormData) => processRefund(paymentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "payments", paymentId],
      });

      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
    },
  });
}
