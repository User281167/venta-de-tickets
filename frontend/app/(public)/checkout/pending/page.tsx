"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Box, Text, Button } from "@chakra-ui/react";
import { IconClock } from "@tabler/icons-react";

function PendingInner() {
  const searchParams = useSearchParams();
  const collectionStatus = searchParams.get("collection_status");

  return (
    <Box textAlign="center">
      <IconClock size={64} color="#ffbf00" />
      <Text fontSize="2xl" fontWeight="bold" color="brand.light" mt={4}>
        Pago pendiente
      </Text>

      {collectionStatus && (
        <Text fontSize="sm" color="brand.muted" mt={2}>
          Estado: {collectionStatus}
        </Text>
      )}

      <Text fontSize="sm" color="brand.muted" mt={4}>
        El pago está siendo procesado. Recibirás la confirmación por correo
        electrónico una vez se complete.
      </Text>

      <Text fontSize="sm" color="brand.muted" mt={2}>
        Si pagaste en efectivo, puede tardar hasta 24 horas hábiles en
        confirmarse.
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

export default function CheckoutPendingPage() {
  return (
    <Suspense fallback={null}>
      <PendingInner />
    </Suspense>
  );
}
