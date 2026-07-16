"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Flex, Text, VStack } from "@chakra-ui/react";
import { IconCircleCheck } from "@tabler/icons-react";
import { useCart } from "@/features/ticket-purchase/hooks/useCart";
import { CheckoutResultCard } from "@/features/ticket-purchase/components/CheckoutResultCard";

function SuccessInner() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const cleared = useRef(false);

  const paymentId = searchParams.get("payment_id");
  const collectionStatus = searchParams.get("collection_status");
  const externalRef = searchParams.get("external_reference");

  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    clearCart();
  }, [clearCart]);

  const details = (
    <VStack align="stretch" gap={2}>
      {paymentId && (
        <Flex justify="space-between" fontSize="sm">
          <Text color="brand.muted">ID de transacción</Text>
          <Text color="white" fontWeight="semibold" fontFamily="mono">
            {paymentId}
          </Text>
        </Flex>
      )}

      {collectionStatus && (
        <Flex justify="space-between" fontSize="sm">
          <Text color="brand.muted">Estado</Text>
          <Text color="white" fontWeight="semibold">
            {collectionStatus}
          </Text>
        </Flex>
      )}

      {externalRef && (
        <Flex justify="space-between" fontSize="sm">
          <Text color="brand.muted">Referencia</Text>
          <Text color="white" fontWeight="semibold" fontFamily="mono">
            {externalRef}
          </Text>
        </Flex>
      )}

      <Text fontSize="sm" color="brand.muted" mt={2}>
        Recibirás tus entradas por correo electrónico.
      </Text>
    </VStack>
  );

  return (
    <CheckoutResultCard
      icon={<IconCircleCheck size={48} color="#00e5ff" />}
      title="Pago exitoso"
      subtitle="Tu compra se completó correctamente"
      details={details}
      primaryAction={{ label: "Volver a entradas", href: "/entradas" }}
      statusColor="#00e5ff"
      bgGlow="rgba(0,229,255,0.15)"
    />
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  );
}
