"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Text } from "@chakra-ui/react";
import { IconCircleX } from "@tabler/icons-react";
import { CheckoutResultCard } from "@/features/ticket-purchase/components/CheckoutResultCard";

function FailureInner() {
  const searchParams = useSearchParams();
  const collectionStatus = searchParams.get("collection_status");
  const reason = collectionStatus
    ? `Estado: ${collectionStatus}`
    : "No se pudo completar el pago";

  return (
    <CheckoutResultCard
      icon={<IconCircleX size={48} color="#A01060" />}
      title="Donación rechazada"
      subtitle="El pago no pudo ser procesado"
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
      primaryAction={{ label: "Volver a intentar", href: "/", bg: "utp.magenta", color: "white" }}
      statusColor="#A01060"
      bgGlow="rgba(160, 16, 96, 0.15)"
    />
  );
}

export default function DonacionFailurePage() {
  return (
    <Suspense fallback={null}>
      <FailureInner />
    </Suspense>
  );
}