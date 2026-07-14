"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Box, Text, Button } from "@chakra-ui/react";
import { IconCircleCheck } from "@tabler/icons-react";
import { useCart } from "@/features/ticket-purchase/hooks/useCart";

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

  return (
    <Box textAlign="center">
      <IconCircleCheck size={64} color="#00e5ff" />

      <Text fontSize="2xl" fontWeight="bold" color="brand.light" mt={4}>
        Pago exitoso
      </Text>

      {paymentId && (
        <Text fontSize="sm" color="brand.muted" mt={2}>
          ID de transacción: {paymentId}
        </Text>
      )}

      {collectionStatus && (
        <Text fontSize="sm" color="brand.muted">
          Estado: {collectionStatus}
        </Text>
      )}

      {externalRef && (
        <Text fontSize="sm" color="brand.muted">
          Referencia: {externalRef}
        </Text>
      )}

      <Text fontSize="sm" color="brand.muted" mt={4}>
        Recibirás tus entradas por correo electrónico.
      </Text>

      <Button
        asChild
        mt={6}
        bg="brand.cyan"
        color="brand.dark"
        fontWeight="bold"
        _hover={{ opacity: 0.9 }}
      >
        <Link href="/entradas">Volver a entradas</Link>
      </Button>
    </Box>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  );
}
