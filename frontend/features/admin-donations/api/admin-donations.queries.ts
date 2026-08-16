import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { authFetch } from "@/shared/api/admin-fetch";
import type {
  DonationListResponse,
  DonationFilters,
} from "../types";
import { DonationCounter } from "@/features/donaciones/donation.types";

async function fetchDonations(
  filters: DonationFilters,
): Promise<DonationListResponse> {
  const params = new URLSearchParams();
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));

  if (filters.state) params.set("state", filters.state);
  if (filters.account) params.set("account", filters.account);
  if (filters.search) params.set("search", filters.search);

  return authFetch<DonationListResponse>(
    `/api/admin/donations?${params.toString()}`,
  );
}

export function useDonations(filters: DonationFilters) {
  return useQuery({
    queryKey: ["admin", "donations", filters],
    queryFn: () => fetchDonations(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
  });
}

export function useAdminDonationCounter() {
  return useQuery({
    queryKey: ["admin", "donations", "counter"],
    queryFn: async () => {
      const res = await fetch("/api/donaciones/counter", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("No se pudo cargar el contador");
      }

      return res.json() as Promise<DonationCounter>;
    },
    staleTime: 1000 * 30,
  });
}

interface UpdateCounterInput {
  currentValue?: number;
  metaValue?: number;
}

export function useUpdateDonationCounter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCounterInput) =>
      authFetch<DonationCounter>("/api/admin/donations/counter", {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin", "donations", "counter"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["donation", "counter"],
      });
    },
  });
}
