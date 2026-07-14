"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Box, Text, Button } from "@chakra-ui/react";
import { IconCircleX } from "@tabler/icons-react";

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
  const reason = collectionStatus
    ? FAILURE_REASON[collectionStatus] ?? `Estado: ${collectionStatus}`
    : "No se pudo completar el pago";

  return (
    <Box textAlign="center">
      <IconCircleX size={64} color="#ff0f7b" />
      <Text fontSize="2xl" fontWeight="bold" color="brand.light" mt={4}>
        Pago rechazado
      </Text>

      <Text fontSize="md" color="brand.muted" mt={2}>
        {reason}
      </Text>

      <Text fontSize="sm" color="brand.muted" mt={4}>
        Puedes intentarlo de nuevo o usar otro medio de pago.
      </Text>

      <Button
        asChild
        mt={6}
        bg="brand.cyan"
        color="brand.dark"
        fontWeight="bold"
        _hover={{ opacity: 0.9 }}
      >
        <Link href="/entradas">Intentar de nuevo</Link>
      </Button>
    </Box>
  );
}

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={null}>
      <FailureInner />
    </Suspense>
  );
}
