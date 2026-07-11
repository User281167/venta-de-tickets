import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { authFetch } from "@/shared/api/admin-fetch";

export type UserRow = {
  id: string;
  fullName: string;
  email: string;
  role: string | null;
  createdAt: string;
  onboardingSurveyDone: boolean;
};

export type UserListResponse = {
  data: UserRow[];
  total: number;
  page: number;
  limit: number;
};

async function fetchUsers(
  page: number,
  limit: number,
  search?: string,
): Promise<UserListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search) {
    params.set("search", search);
  }

  return authFetch<UserListResponse>(`/api/admin/users?${params}`);
}

export function useUsers(page: number, limit: number, search?: string) {
  return useQuery({
    queryKey: ["admin", "users", page, limit, search],
    queryFn: () => fetchUsers(page, limit, search),
    placeholderData: keepPreviousData,
  });
}
