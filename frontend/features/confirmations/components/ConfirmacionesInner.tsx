"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX,
} from "@tabler/icons-react";
import {
  useConfirmByToken,
  useRejectByToken,
} from "@/features/confirmations/hooks/useConfirmByToken";
import { ResultCard } from "./ResultCard";

type Status = "idle" | "confirming" | "rejecting" | "confirmed" | "rejected" | "error";

export function ConfirmacionesInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const confirmMutation = useConfirmByToken();
  const rejectMutation = useRejectByToken();

  if (!token) {
    return (
      <ResultCard
        icon={<IconAlertTriangle size={48} color="#ff8a00" />}
        title="Link inválido"
        subtitle="El link de confirmación no contiene un token válido."
        statusColor="#ff8a00"
        primaryAction={{ label: "Ir a mi cuenta", href: "/mi-cuenta/entradas" }}
      />
    );
  }

  if (status === "confirmed") {
    return (
      <ResultCard
        icon={<IconCircleCheck size={48} color="#00e5ff" />}
        title="Entrada confirmada"
        subtitle="Tu ticket fue confirmado correctamente. Puedes pasar al evento cuando te llamen."
        statusColor="#00e5ff"
        primaryAction={{ label: "Ver mis entradas", href: "/mi-cuenta/entradas" }}
      />
    );
  }

  if (status === "rejected") {
    return (
      <ResultCard
        icon={<IconCircleX size={48} color="#ef4444" />}
        title="Entrada rechazada"
        subtitle="Tu ticket volvió a estado pagado. Si fue un error, contáctanos."
        statusColor="#ef4444"
        primaryAction={{ label: "Ir a mi cuenta", href: "/mi-cuenta/entradas" }}
      />
    );
  }

  if (status === "error") {
    return (
      <ResultCard
        icon={<IconAlertTriangle size={48} color="#ff8a00" />}
        title="No se pudo procesar"
        subtitle={errorMessage ?? "El link puede estar expirado o ya fue usado."}
        statusColor="#ff8a00"
        primaryAction={{ label: "Ir a mi cuenta", href: "/mi-cuenta/entradas" }}
      />
    );
  }

  const isPending = status === "confirming" || status === "rejecting";

  const onConfirm = async () => {
    setStatus("confirming");

    try {
      await confirmMutation.mutateAsync(token);
      setStatus("confirmed");
    } catch (err) {
      setErrorMessage((err as Error).message);
      setStatus("error");
    }
  };

  const onReject = async () => {
    setStatus("rejecting");

    try {
      await rejectMutation.mutateAsync(token);
      setStatus("rejected");
    } catch (err) {
      setErrorMessage((err as Error).message);
      setStatus("error");
    }
  };

  return (
    <Box
      minH="80vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={{ base: 6, md: 10 }}
      px={4}
    >
      <VStack
        maxW="480px"
        w="full"
        bg="brand.panel"
        borderRadius="2xl"
        p={{ base: 6, md: 8 }}
        border="1px solid"
        borderColor="rgba(255,255,255,0.08)"
        boxShadow="0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(0,229,255,0.15)"
        textAlign="center"
        gap={5}
      >
        <Box
          p={4}
          borderRadius="full"
          bg="rgba(0,229,255,0.08)"
          border="1px solid rgba(0,229,255,0.25)"
          display="inline-flex"
        >
          <IconCircleCheck size={48} color="#00e5ff" />
        </Box>

        <VStack gap={2}>
          <Heading as="h1" size="xl" color="white" lineHeight="1.2">
            Confirma tu entrada
          </Heading>
          <Text fontSize="md" color="brand.muted">
            ¿Estás presente en la puerta del evento?
          </Text>
        </VStack>

        <HStack w="full" gap={3}>
          <Button
            w="full"
            h="52px"
            borderRadius="xl"
            bg="brand.cyan"
            color="brand.dark"
            fontWeight="black"
            fontSize="md"
            loading={isPending && status === "confirming"}
            disabled={isPending}
            onClick={onConfirm}
            _hover={{ opacity: 0.9 }}
          >
            Sí, confirmar
          </Button>

          <Button
            w="full"
            h="52px"
            borderRadius="xl"
            bg="transparent"
            color="white"
            fontWeight="bold"
            fontSize="md"
            border="1px solid"
            borderColor="rgba(255,255,255,0.2)"
            loading={isPending && status === "rejecting"}
            disabled={isPending}
            onClick={onReject}
            _hover={{ bg: "rgba(255,255,255,0.05)" }}
          >
            No, rechazar
          </Button>
        </HStack>

        <Text fontSize="xs" color="brand.muted" mt={1}>
          Este link es de un solo uso y caduca pronto.
        </Text>
      </VStack>
    </Box>
  );
}
