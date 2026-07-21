"use client";

import { useCallback, useState } from "react";

import { useScanTicket } from "../api/checkin.queries";
import type { TicketSummary } from "../schemas/checkin.schema";

export function useCheckinSession() {
  const scanMutation = useScanTicket();

  const [currentTicket, setCurrentTicket] = useState<TicketSummary | null>(
    null,
  );
  const [lastScannedToken, setLastScannedToken] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const scan = useCallback(
    async (qrToken: string) => {
      if (qrToken === lastScannedToken) return;

      setLastScannedToken(qrToken);
      setIsScanning(false);

      try {
        const ticket = await scanMutation.mutateAsync({ qrToken });
        setCurrentTicket(ticket);
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
  }, []);

  const resumeScanner = useCallback(() => {
    setCurrentTicket(null);
    setLastScannedToken(null);
    setIsScanning(true);
  }, []);

  return {
    currentTicket,
    isScanning,
    isScanningRequest: scanMutation.isPending,
    error: scanMutation.error,
    scan,
    clearSession,
    resumeScanner,
  };
}
