"use client";

import { useMe } from "@/features/users/hooks/useProfile";
import { useAuth } from "@/providers/AuthProvider";

export function useMyEgresado(): boolean | null {
  const { session, isLoading: authLoading } = useAuth();
  const loggedIn = !authLoading && !!session;

  const { data } = useMe({ enabled: loggedIn });

  if (!loggedIn) return null;
  return data?.user.egresado ?? null;
}
