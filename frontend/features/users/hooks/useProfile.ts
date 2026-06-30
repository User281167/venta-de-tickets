"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptPrivacy,
  fetchMe,
  updateMe,
} from "../api/users.client";
import type { UpdateUserInput } from "../schemas/users.schema";

const ME_KEY = ["me"] as const;

export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: fetchMe,
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

export function useAcceptPrivacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptPrivacy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ME_KEY });
    },
  });
}
