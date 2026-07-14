"use client";

import { useMutation } from "@tanstack/react-query";
import { createCheckoutPreference } from "./checkout.api";
import type { CheckoutItem } from "./checkout.api";

export function useCreateCheckoutPreference() {
  return useMutation({
    mutationFn: (items: CheckoutItem[]) =>
      createCheckoutPreference(
        items,
        typeof window !== "undefined"
        ? `${window.location.origin}/checkout/success`
        : "",
      ),
  });
}
