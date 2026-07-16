"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Flex, Text, VStack } from "@chakra-ui/react";
import { IconClock } from "@tabler/icons-react";
import { CheckoutResultCard } from "@/features/ticket-purchase/components/CheckoutResultCard";

function PendingInner() {
  const searchParams = useSearchParams();
  const collectionStatus = searchParams.get("collection_status");

  const details = (
    <VStack align="stretch" gap={2}>
      {collectionStatus && (
        <Flex justify="space-between" fontSize="sm">
          <Text color="brand.muted">Estado</Text>
          <Text color="white" fontWeight="semibold">
            {collectionStatus}
          </Text>
        </Flex>
      )}

      <Text fontSize="sm" color="brand.muted" mt={2}>
        El pago está siendo procesado. Recibirás la confirmación por correo
        electrónico una vez se complete.
      </Text>

      <Text fontSize="sm" color="brand.muted">
        Si pagaste en efectivo, puede tardar hasta 24 horas hábiles en
        confirmarse.
      </Text>
    </VStack>
  );

  return (
    <CheckoutResultCard
      icon={<IconClock size={48} color="#ffbf00" />}
      title="Pago pendiente"
      subtitle="Estamos esperando la confirmación de Mercado Pago"
      details={details}
      primaryAction={{ label: "Volver a entradas", href: "/entradas" }}
      statusColor="#ffbf00"
      bgGlow="rgba(255,191,0,0.15)"
    />
  );
}

export default function CheckoutPendingPage() {
  return (
    <Suspense fallback={null}>
      <PendingInner />
    </Suspense>
  );
}
