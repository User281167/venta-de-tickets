"use client";

import { useCallback, useState } from "react";

import { useScanTicket } from "../api/checkin.queries";
import type { CheckerAction, TicketSummary } from "../schemas/checkin.schema";

type ActionResult =
  | { kind: "auto-clear"; action: CheckerAction }
  | { kind: "keep-ticket"; action: CheckerAction };

export function useCheckinSession() {
  const scanMutation = useScanTicket();

  const [currentTicket, setCurrentTicket] = useState<TicketSummary | null>(
    null,
  );
  const [lastScannedToken, setLastScannedToken] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<CheckerAction | null>(null);

  const scan = useCallback(
    async (qrToken: string) => {
      if (qrToken === lastScannedToken) return;

      setLastScannedToken(qrToken);

      try {
        const ticket = await scanMutation.mutateAsync({ qrToken });
        setCurrentTicket(ticket);
        setLastAction(null);
      } catch {
        // error surfaced via scanMutation.error + toast in <CheckinSection>
      }
    },
    [lastScannedToken, scanMutation],
  );

  const clearSession = useCallback(() => {
    setCurrentTicket(null);
    setLastScannedToken(null);
    setLastAction(null);
  }, []);

  const setTicketStatus = useCallback(
    (status: TicketSummary["status"], allowedActions: CheckerAction[] = []) => {
      setCurrentTicket((prev) =>
        prev ? { ...prev, status, allowedActions } : prev,
      );
    },
    [],
  );

  const handleActionSuccess = useCallback(
    (action: CheckerAction): ActionResult => {
      setLastAction(action);

      if (action === "confirm_entry_direct" || action === "allow_entry") {
        return { kind: "auto-clear", action };
      }

      return { kind: "keep-ticket", action };
    },
    [],
  );

  return {
    currentTicket,
    isScanningRequest: scanMutation.isPending,
    error: scanMutation.error,
    lastAction,
    scan,
    clearSession,
    setTicketStatus,
    handleActionSuccess,
  };
}

export type CheckinSession = ReturnType<typeof useCheckinSession>;
export type { ActionResult };
