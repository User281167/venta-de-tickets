"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flex, Spinner, Text, VStack, Icon } from "@chakra-ui/react";
import { IconCircleCheck, IconCircleX, IconClock } from "@tabler/icons-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type ResultStatus = "completed" | "failed" | "pending" | null;

function ResultInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refPayco = searchParams.get("ref_payco");
  const [result, setResult] = useState<ResultStatus>(null);

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

        if (data.status === "completed") {
          setResult("completed");
        } else if (data.status === "failed") {
          setResult("failed");
        } else {
          setResult("pending");
        }
      } catch {
        if (!cancelled) setResult("pending");
      }
    }

    check();
    return () => { cancelled = true; };
  }, [refPayco]);

  useEffect(() => {
    if (!result) return;

    const timer = setTimeout(() => {
      switch (result) {
        case "completed":
          router.replace("/checkout/state/success");
          break;
        case "failed":
          router.replace("/checkout/state/failure");
          break;
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [result, router]);

  if (!refPayco) {
    return (
      <Flex direction="column" align="center" justify="center" p={8} color="white" minH="50vh">
        <Icon as={IconCircleX} boxSize={12} color="red.400" />
        <Text mt={4} fontSize="lg" fontWeight="bold">
          Referencia de pago no encontrada
        </Text>
      </Flex>
    );
  }

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
      {result === "completed" && (
        <>
          <Icon as={IconCircleCheck} boxSize={16} color="green.400" />
          <VStack gap={1}>
            <Text fontSize="2xl" fontWeight="bold">Pago exitoso</Text>
            <Text fontSize="sm" color="white/60">
              Redirigiendo a la confirmación...
            </Text>
          </VStack>
        </>
      )}

      {result === "failed" && (
        <>
          <Icon as={IconCircleX} boxSize={16} color="red.400" />
          <VStack gap={1}>
            <Text fontSize="2xl" fontWeight="bold">Pago rechazado</Text>
            <Text fontSize="sm" color="white/60">
              Tu pago no pudo ser procesado. Intenta de nuevo.
            </Text>
          </VStack>
        </>
      )}

      {result === "pending" && (
        <>
          <Icon as={IconClock} boxSize={16} color="yellow.400" />
          <VStack gap={1}>
            <Text fontSize="xl" fontWeight="bold">
              Pago pendiente
            </Text>
            <Text fontSize="sm" color="white/60">
              Estamos confirmando tu transacción. Esto tomará solo unos segundos.
            </Text>
          </VStack>
          <Spinner size="xl" color="#00e5ff" mt={4} />
        </>
      )}

      {result === null && (
        <>
          <Spinner size="xl" color="#00e5ff" />
          <Text fontSize="lg" fontWeight="bold">
            Verificando tu pago...
          </Text>
        </>
      )}
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