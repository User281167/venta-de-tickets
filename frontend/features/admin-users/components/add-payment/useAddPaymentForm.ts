"use client";

import { useCallback, useMemo, useState } from "react";
import { useAdminTicketTypes } from "@/features/ticket-types/api/ticket-types.queries";
import { useCreateAdminPayment } from "@/features/admin-payments/api/admin-payments.queries";
import type { UserRow } from "../../api/admin-users.queries";

export type PaymentTicketInput = {
  ticketTypeId: string;
  quantity: number;
};

export function useAddPaymentForm(user: UserRow | null, onClose: () => void) {
  const { data: ticketTypes, isLoading } = useAdminTicketTypes();
  const mutation = useCreateAdminPayment();

  const activeTicketTypes = useMemo(
    () => (ticketTypes ?? []).filter((tt) => tt.isActive),
    [ticketTypes],
  );

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [provider, setProvider] = useState<string>("MANUAL");

  const reset = useCallback(() => {
    setQuantities({});
    setProvider("MANUAL");
  }, []);

  const total = useMemo(() => {
    return activeTicketTypes.reduce(
      (sum, tt) => sum + tt.price * (quantities[tt.id] ?? 0),
      0,
    );
  }, [activeTicketTypes, quantities]);

  const hasSelection = useMemo(
    () => Object.values(quantities).some((q) => q > 0),
    [quantities],
  );

  const updateQuantity = useCallback((ticketTypeId: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [ticketTypeId]: value }));
  }, []);

  const submit = useCallback(async () => {
    if (!user || !hasSelection) return;

    const tickets = activeTicketTypes
      .filter((tt) => (quantities[tt.id] ?? 0) > 0)
      .map((tt) => ({
        ticketTypeId: tt.id,
        quantity: quantities[tt.id]!,
      }));

    await mutation.mutateAsync({
      userId: user.id,
      provider: provider as "MANUAL" | "GIFT",
      tickets,
    });

    reset();
    onClose();
  }, [
    user,
    hasSelection,
    activeTicketTypes,
    quantities,
    provider,
    mutation,
    reset,
    onClose,
  ]);

  const cancel = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  return {
    activeTicketTypes,
    quantities,
    provider,
    total,
    hasSelection,
    isLoading,
    isPending: mutation.isPending,
    updateQuantity,
    setProvider,
    submit,
    cancel,
  };
}
