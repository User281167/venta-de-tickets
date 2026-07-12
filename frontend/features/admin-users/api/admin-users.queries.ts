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
};

export type UserListResponse = {
  data: UserRow[];
  total: number;
  page: number;
  limit: number;
};

export type CreateUserInput = {
  email: string;
  password: string;
  fullName: string;
  cedula?: string;
  phone?: string | null;
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

async function createUser(data: CreateUserInput): Promise<UserRow> {
  return authFetch<UserRow>("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput) => createUser(data),
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

async function batchCreateUsers(
  data: CreateUserInput[],
): Promise<UserRow[]> {
  return authFetch<UserRow[]>("/api/admin/users/batch", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function useBatchCreateUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput[]) => batchCreateUsers(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
    },
  });
}
