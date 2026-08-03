import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/shared/api/admin-fetch";
import type {
  AuditLogFilters,
  AuditLogResponse,
} from "../types";

async function fetchAuditLog(
  filters: AuditLogFilters,
): Promise<AuditLogResponse> {
  const params = new URLSearchParams();
  params.set("limit", String(filters.limit));

  if (filters.entityType) {
    params.set("entityType", filters.entityType);
  }

  return authFetch<AuditLogResponse>(
    `/api/audit-log?${params.toString()}`,
  );
}

export function useAuditLog(filters: AuditLogFilters) {
  return useQuery({
    queryKey: ["audit-log", filters],
    queryFn: () => fetchAuditLog(filters),
    refetchInterval: 4000,
    staleTime: 1000 * 3,
    gcTime: 1000 * 60 * 10,
  });
}
