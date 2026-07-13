"use client";

import { Alert } from "@chakra-ui/react";
import type { ReactNode } from "react";

export function PaymentsError({ children }: { children: ReactNode }) {
  return (
    <Alert.Root status="error" borderRadius="md">
      <Alert.Indicator />
      <Alert.Title>Error</Alert.Title>
      <Alert.Description>{children}</Alert.Description>
    </Alert.Root>
  );
}
