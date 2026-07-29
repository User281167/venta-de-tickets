"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Text } from "@chakra-ui/react";
import { IconCircleX } from "@tabler/icons-react";
import { CheckoutResultCard } from "@/features/ticket-purchase/components/CheckoutResultCard";

const FAILURE_REASON: Record<string, string> = {
  rejected: "Pago rechazado por el banco",
  cc_rejected: "Tarjeta rechazada",
  insufficient_amount: "Fondos insuficientes",
  duplicate: "Pago duplicado",
  fraud: "Pago marcado como fraudulento",
};

function FailureInner() {
  const searchParams = useSearchParams();
  const collectionStatus = searchParams.get("collection_status");
  const reasonText = searchParams.get("reason_text");
  const reason = reasonText
    ?? (collectionStatus
      ? FAILURE_REASON[collectionStatus] ?? `Estado: ${collectionStatus}`
      : "No se pudo completar el pago");

  return (
    <CheckoutResultCard
      icon={<IconCircleX size={48} color="#A01060" />}
      title="Pago rechazado"
      subtitle="No pudimos procesar tu pago"
      details={
        <>
          <Text fontSize="md" color="utp.magenta" fontWeight="semibold">
            {reason}
          </Text>
          <Text fontSize="sm" color="brand.muted" mt={2}>
            Puedes intentarlo de nuevo o usar otro medio de pago.
          </Text>
        </>
      }
      primaryAction={{ label: "Intentar de nuevo", href: "/entradas", bg: "utp.magenta", color: "white" }}
      statusColor="#A01060"
      bgGlow="rgba(160, 16, 96, 0.15)"
    />
  );
}

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={null}>
      <FailureInner />
    </Suspense>
  );
}
