import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { authFetch } from "@/shared/api/admin-fetch";
import type {
  DonationListResponse,
  DonationFilters,
} from "../types";

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
