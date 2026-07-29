"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flex, Spinner, Text } from "@chakra-ui/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function ResultInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refPayco = searchParams.get("ref_payco");

  useEffect(() => {
    if (!refPayco) return;

    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(
          `${BASE_URL}/api/payments/epayco/status-by-ref/${refPayco}`,
        );
        const data = await res.json();

        if (cancelled) return;

        const reasonText = data.validation?.x_response_reason_text;

        switch (data.status) {
          case "completed":
            router.replace(`/checkout/state/success?external_reference=${encodeURIComponent(refPayco ?? "")}`);
            break;
          case "failed": {
            const reason = reasonText ? encodeURIComponent(reasonText) : "";
            router.replace(`/checkout/state/failure?reason_text=${reason}&external_reference=${encodeURIComponent(refPayco ?? "")}`);
            break;
          }
          default:
            setTimeout(() => { if (!cancelled) router.replace("/checkout/state/pending"); }, 2000);
        }
      } catch {
        if (!cancelled) router.replace("/checkout/state/pending");
      }
    }

    check();
    return () => { cancelled = true; };
  }, [refPayco, router]);

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap={4}
      p={8}
      color="white"
      minH="50vh"
    >
      <Spinner size="xl" color="#00e5ff" />
      <Text fontSize="lg" fontWeight="bold">
        Confirmando tu pago...
      </Text>
    </Flex>
  );
}

export default function CheckoutResultPage() {
  return (
    <Suspense fallback={
      <Flex align="center" justify="center" minH="50vh">
        <Spinner size="xl" color="#00e5ff" />
      </Flex>
    }>
      <ResultInner />
    </Suspense>
  );
}
