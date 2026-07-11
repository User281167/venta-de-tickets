"use client";

import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/shared/api/admin-fetch";

export type AdminProfile = {
  id: string;
  email: string;
  role: "super_admin" | "admin" | "checker";
};

export function useAdmin() {
  const { data, isLoading, error } = useQuery<AdminProfile>({
    queryKey: ["admin", "me"],
    queryFn: () => authFetch<AdminProfile>("/api/admin/me"),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    admin: data ?? null,
    role: data?.role ?? null,
    isLoading,
    isUnauthorized: error?.message === "unauthorized",
  };
}
