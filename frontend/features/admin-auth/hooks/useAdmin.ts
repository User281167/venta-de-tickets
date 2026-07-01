"use client";

import { useQuery } from "@tanstack/react-query";

export type AdminProfile = {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "organizer" | "staff" | "checker";
};

async function fetchAdmin(): Promise<AdminProfile> {
  const res = await fetch("/api/admin/me", {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("unauthorized");
    }
    throw new Error("Failed to fetch admin profile");
  }

  return res.json();
}

export function useAdmin() {
  const { data, isLoading, error } = useQuery<AdminProfile>({
    queryKey: ["admin", "me"],
    queryFn: fetchAdmin,
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
