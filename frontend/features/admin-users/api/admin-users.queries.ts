import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { authFetch } from "@/shared/api/admin-fetch";

export type UserRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  cedula: string | null;
  role: string | null;
  isActive: boolean;
  createdAt: string;
  onboardingSurveyDone: boolean;
};

export type UserListResponse = {
  data: UserRow[];
  total: number;
  page: number;
  limit: number;
};

export type UpdateUserInput = {
  fullName?: string;
  phone?: string | null;
  cedula?: string;
  role?: "admin" | "checker" | "client";
  isActive?: boolean;
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

async function updateUser(id: string, data: UpdateUserInput): Promise<UserRow> {
  return authFetch<UserRow>(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
    },
  });
}

export function getUsersData(): { data: UserRow[] } | undefined {
  const queryClient = useQueryClient();

  return queryClient.getQueryData<{ data: UserRow[] }>([
    "admin",
    "users",
  ]);
}
