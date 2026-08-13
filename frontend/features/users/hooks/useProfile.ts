"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptPolicies, fetchMe, updateMe } from "../api/users.client";
import type { UpdateUserInput } from "../schemas/users.schema";
import type { PolicyType } from "../types/policy.types";

const ME_KEY = ["me"] as const;

export function useMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: fetchMe,
    enabled: options?.enabled,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserInput) => updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ME_KEY });
    },
  });
}

export function useAcceptPolicies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (types: PolicyType[]) => acceptPolicies(types),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ME_KEY });
    },
  });
}
