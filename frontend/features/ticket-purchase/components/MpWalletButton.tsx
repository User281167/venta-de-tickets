"use client";

import { useEffect, useRef } from "react";
import { Box, Skeleton } from "@chakra-ui/react";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

interface MpWalletButtonProps {
  preferenceId: string | null;
  onError?: (error: unknown) => void;
}

export function MpWalletButton({ preferenceId, onError }: MpWalletButtonProps) {
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;

      try {
        initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ?? "");
      } catch {
        // init already called — safe to ignore
      }
    }
  }, []);

  if (!preferenceId) {
    return (
      <Box data-testid="mp-wallet-container">
        <Skeleton height="48px" borderRadius="md" />
      </Box>
    );
  }

  return (
    <Box data-testid="mp-wallet-container">
      <Wallet initialization={{ preferenceId }} onError={onError} />
    </Box>
  );
}
