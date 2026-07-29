"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Box,
  Button,
  Flex,
  Link,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import { useDonationStatus } from "@/features/donaciones/hooks/useDonaciones";

function extractExternalReference(externalRef: string | null): string | null {
  if (!externalRef) return null;
  const segments = externalRef.split("/");
  return segments[segments.length - 1]?.split("?")[0] ?? null;
}

function RetornoInner() {
  const searchParams = useSearchParams();
  const rawRef = searchParams.get("external_reference");
  const externalReference = extractExternalReference(rawRef);

  const { data, isLoading, isError, error, refetch } =
    useDonationStatus(externalReference);

  const statusConfig: Record<
    string,
    { icon: React.ReactNode; color: string; title: string; description: string }
  > = {
    confirmed: {
      icon: <IconCircleCheck size={48} />,
      color: "#00e5ff",
      title: "Donación confirmada",
      description: "Gracias por tu donación. Ha sido procesada exitosamente.",
    },
    rejected: {
      icon: <IconCircleX size={48} />,
      color: "#ff0f7b",
      title: "Donación rechazada",
      description: "El pago no pudo ser procesado. Intenta de nuevo.",
    },
    cancelled: {
      icon: <IconCircleX size={48} />,
      color: "#aeb8d8",
      title: "Donación cancelada",
      description: "Cancelaste el proceso de donación.",
    },
  };

  if (isError) {
    return (
      <VStack
        gap={4}
        p={8}
        bg="brand.panel"
        borderRadius="2xl"
        border="1px solid"
        borderColor="whiteAlpha.200"
        maxW="420px"
        textAlign="center"
      >
        <IconCircleX size={48} color="#ff0f7b" />

        <Text fontSize="xl" fontWeight="bold" color="white">
          Error al consultar
        </Text>

        <Text fontSize="sm" color="brand.muted">
          {(error as Error)?.message ??
            "No pudimos verificar el estado de tu donación."}
        </Text>

        <Button
          onClick={() => refetch()}
          bgGradient="linear(100deg, #ff0f7b, #7c3cff)"
          color="white"
          _hover={{ opacity: 0.9 }}
        >
          Reintentar
        </Button>
      </VStack>
    );
  }

  const status = data?.state ?? "pending";
  const config = statusConfig[status];

  return (
    <>
      {isLoading ? (
        <Stack align="center" gap={4}>
          <Spinner size="xl" color="brand.pink" />
          <Text color="brand.muted">Consultando estado de tu donación...</Text>
        </Stack>
      ) : config ? (
        <VStack
          gap={4}
          p={8}
          bg="brand.panel"
          borderRadius="2xl"
          border="1px solid"
          borderColor="whiteAlpha.200"
          maxW="420px"
          textAlign="center"
        >
          <Box color={config.color}>{config.icon}</Box>

          <Text fontSize="xl" fontWeight="bold" color="white">
            {config.title}
          </Text>

          <Text fontSize="sm" color="brand.muted">
            {config.description}
          </Text>

          {data && (
            <Stack gap={1} fontSize="sm" w="full" pt={2}>
              <Flex justify="space-between">
                <Text color="brand.muted">Monto</Text>
                <Text color="white" fontWeight="semibold">
                  $
                  {(data.amountCents / 100).toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  })}
                </Text>
              </Flex>
            </Stack>
          )}

          <Link href="/" color="brand.muted" _hover={{ color: "white" }}>
            Volver al inicio
          </Link>
        </VStack>
      ) : (
        <Text color="brand.muted">
          No se encontró información de la donación.
        </Text>
      )}

      {status === "pending" && (
        <Stack
          align="center"
          gap={2}
          position="fixed"
          bottom={8}
          left="50%"
          transform="translateX(-50%)"
        >
          <Spinner size="sm" color="brand.cyan" />

          <Text fontSize="sm" color="brand.muted">
            Esperando confirmación del pago...
          </Text>
        </Stack>
      )}
    </>
  );
}

export default function DonacionRetornoPage() {
  return (
    <Suspense fallback={null}>
      <RetornoInner />
    </Suspense>
  );
}
