import { useQuery, keepPreviousData } from "@tanstack/react-query";

export type UserRow = {
  id: string;
  fullName: string;
  email: string;
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

  const res = await fetch(`/api/admin/users?${params}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error("forbidden");
    }
    throw new Error("Failed to fetch users");
  }

  return res.json();
}

export function useUsers(page: number, limit: number, search?: string) {
  return useQuery({
    queryKey: ["admin", "users", page, limit, search],
    queryFn: () => fetchUsers(page, limit, search),
    placeholderData: keepPreviousData,
  });
}
