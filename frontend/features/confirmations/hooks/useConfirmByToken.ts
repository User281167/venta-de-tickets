"use client";

import { useMutation } from "@tanstack/react-query";
import { confirmByToken, rejectByToken } from "../api/confirmations.client";

export function useConfirmByToken() {
  return useMutation({
    mutationFn: (token: string) => confirmByToken(token),
  });
}

export function useRejectByToken() {
  return useMutation({
    mutationFn: (token: string) => rejectByToken(token),
  });
}
