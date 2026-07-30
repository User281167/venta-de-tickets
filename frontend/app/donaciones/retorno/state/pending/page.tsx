"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flex, Spinner, Text, VStack } from "@chakra-ui/react";
import { IconClock } from "@tabler/icons-react";
import { CheckoutResultCard } from "@/features/ticket-purchase/components/CheckoutResultCard";
import { getDonationStatus } from "@/features/donaciones/api/donaciones.client";

function PendingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const externalRef = searchParams.get("external_reference");
  const [polling, setPolling] = useState(!!externalRef);

  useEffect(() => {
    if (!externalRef) return;

    const interval = setInterval(async () => {
      try {
        const status = await getDonationStatus(externalRef);

        if (status.state === "confirmed") {
          clearInterval(interval);
          router.push(`/donaciones/retorno/state/success?external_reference=${externalRef}`);
        } else if (status.state === "rejected") {
          clearInterval(interval);
          setPolling(false);
        }
      } catch {
        setPolling(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [externalRef, router]);

  const details = (
    <VStack align="stretch" gap={2}>
      <Text fontSize="sm" color="brand.muted" mt={2}>
        Estamos esperando la confirmación del pago.
      </Text>
      <Text fontSize="sm" color="brand.muted">
        Recibirás la confirmación por correo electrónico una vez se complete.
      </Text>
      {polling && (
        <Flex align="center" justify="center" gap={2} mt={2}>
          <Spinner size="sm" color="#E94E1B" />
          <Text fontSize="xs" color="brand.muted">
            Verificando estado...
          </Text>
        </Flex>
      )}
    </VStack>
  );

  return (
    <CheckoutResultCard
      icon={<IconClock size={48} color="#E94E1B" />}
      title="Donación pendiente"
      subtitle="Estamos esperando la confirmación del pago"
      details={details}
      primaryAction={{ label: "Volver al inicio", href: "/", bg: "utp.naranja", color: "white" }}
      statusColor="#E94E1B"
      bgGlow="rgba(233, 78, 27, 0.15)"
    />
  );
}

export default function DonacionPendingPage() {
  return (
    <Suspense fallback={null}>
      <PendingInner />
    </Suspense>
  );
}
