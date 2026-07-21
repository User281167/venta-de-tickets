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
  const [isScanning, setIsScanning] = useState(true);
  const [lastAction, setLastAction] = useState<CheckerAction | null>(null);

  const scan = useCallback(
    async (qrToken: string) => {
      if (qrToken === lastScannedToken) return;

      setLastScannedToken(qrToken);
      setIsScanning(false);

      try {
        const ticket = await scanMutation.mutateAsync({ qrToken });
        setCurrentTicket(ticket);
        setLastAction(null);
      } catch {
        setIsScanning(true);
      }
    },
    [lastScannedToken, scanMutation],
  );

  const clearSession = useCallback(() => {
    setCurrentTicket(null);
    setLastScannedToken(null);
    setIsScanning(true);
    setLastAction(null);
  }, []);

  const resumeScanner = useCallback(() => {
    setCurrentTicket(null);
    setLastScannedToken(null);
    setIsScanning(true);
    setLastAction(null);
  }, []);

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
    isScanning,
    isScanningRequest: scanMutation.isPending,
    error: scanMutation.error,
    lastAction,
    scan,
    clearSession,
    resumeScanner,
    handleActionSuccess,
  };
}

export type CheckinSession = ReturnType<typeof useCheckinSession>;
export type { ActionResult };
