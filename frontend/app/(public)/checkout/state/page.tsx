"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flex, Spinner, Text, VStack } from "@chakra-ui/react";
import { useEpaycoStatus } from "@/features/payments/api/epayco.queries";

function StateInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const refPayco = searchParams.get("ref_payco");

  const { data } = useEpaycoStatus(paymentId, refPayco ?? undefined);

  useEffect(() => {
    if (!data) return;

    switch (data.status) {
      case "completed":
        router.replace(`/checkout/state/success?payment_id=${paymentId}`);
        break;
      case "failed":
        router.replace("/checkout/state/failure");
        break;
      case "expired":
        router.replace("/checkout/state/failure");
        break;
    }
  }, [data, router, paymentId]);

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap={4}
      p={8}
      color="white"
    >
      <Spinner size="xl" color="#00e5ff" />
      <VStack gap={1}>
        <Text fontSize="xl" fontWeight="bold">
          Procesando tu pago...
        </Text>
        <Text fontSize="sm" color="brand.muted">
          Estamos confirmando tu transacción. Esto tomará solo unos segundos.
        </Text>
      </VStack>
    </Flex>
  );
}

export default function CheckoutEpaycoStatePage() {
  return (
    <Suspense fallback={null}>
      <StateInner />
    </Suspense>
  );
}
