"use client";

import { useEffect, useRef } from "react";
import { Box, Center, Heading, Spinner, Stack, Text } from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/api-error";
import type { CheckerAction } from "../schemas/checkin.schema";

import { ActionButtons } from "./ActionButtons";
import { ConfirmationPendingOverlay } from "./ConfirmationPendingOverlay";
import { QrScanner } from "./QrScanner";
import { TicketSummaryCard } from "./TicketSummaryCard";
import { useCheckinSession } from "../hooks/useCheckinSession";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_QR: "QR inválido o expirado",
  NOT_FOUND: "Ticket no encontrado",
  TICKET_NOT_AVAILABLE: "Ticket no disponible para esta acción",
  UNAUTHORIZED: "Sesión expirada. Inicia sesión de nuevo.",
  FORBIDDEN: "No tienes permisos para usar el check-in",
  VALIDATION_ERROR: "Datos inválidos",
  NETWORK_ERROR: "No se pudo conectar con el servidor",
};

const ACTION_MESSAGES: Record<
  CheckerAction,
  { title: string; description?: string }
> = {
  confirm_entry_direct: {
    title: "Entrada confirmada",
    description: "El scanner se reiniciará en unos segundos.",
  },
  request_confirmation: {
    title: "Link de confirmación enviado al comprador",
    description: "Vuelve a escanear cuando el comprador haya confirmado.",
  },
  allow_entry: {
    title: "Ingreso permitido",
    description: "El scanner se reiniciará en unos segundos.",
  },
};

function messageFromError(err: unknown): string {
  if (err instanceof ApiError) {
    return ERROR_MESSAGES[err.code] ?? err.message;
  }

  if (err instanceof Error) return err.message;

  return "Error desconocido";
}

const AUTO_CLEAR_DELAY_MS = 3000;

export function CheckinSection() {
  const reduced = useReducedMotion();
  const lastErrorRef = useRef<unknown>(null);
  const autoClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    currentTicket,
    isScanning,
    isScanningRequest,
    error,
    scan,
    resumeScanner,
    clearSession,
    handleActionSuccess,
  } = useCheckinSession();

  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      toast.error(messageFromError(error));
    }

    if (!error) {
      lastErrorRef.current = null;
    }
  }, [error]);

  useEffect(() => {
    return () => {
      if (autoClearRef.current) clearTimeout(autoClearRef.current);
    };
  }, []);

  const onActionSuccess = (action: CheckerAction) => {
    const result = handleActionSuccess(action);
    const msg = ACTION_MESSAGES[action];

    if (msg.description) {
      toast.success(msg.title, { description: msg.description });
    } else {
      toast.success(msg.title);
    }

    if (result.kind === "auto-clear") {
      if (autoClearRef.current) clearTimeout(autoClearRef.current);

      autoClearRef.current = setTimeout(() => {
        clearSession();
      }, AUTO_CLEAR_DELAY_MS);
    }
  };

  const showPendingOverlay = currentTicket?.status === "pending_confirmation";

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ width: "100%" }}
    >
      <Stack gap={6} w="full" maxW="480px" mx="auto">
        <Stack gap={1}>
          <Text
            color="brand.cyan"
            fontSize="xs"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.15em"
          >
            Control de ingreso
          </Text>

          <Heading as="h1" size="2xl" color="white" lineHeight="1.1">
            Check-in
          </Heading>

          <Text color="brand.muted" fontSize="sm">
            Escanea el QR del asistente para validar la entrada.
          </Text>
        </Stack>

        <Box position="relative">
          <QrScanner
            onScan={scan}
            paused={!isScanning || isScanningRequest}
            onResume={resumeScanner}
          />

          {isScanningRequest && (
            <Center
              position="absolute"
              inset={0}
              bg="rgba(2,4,20,0.7)"
              borderRadius="2xl"
              pointerEvents="none"
            >
              <Spinner size="lg" color="brand.cyan" />
            </Center>
          )}
        </Box>

        {currentTicket && (
          <Box position="relative">
            <TicketSummaryCard ticket={currentTicket} />

            {showPendingOverlay && (
              <ConfirmationPendingOverlay
                attendeeName={currentTicket.attendeeName}
              />
            )}
          </Box>
        )}

        {currentTicket && !showPendingOverlay && (
          <ActionButtons ticket={currentTicket} onSuccess={onActionSuccess} />
        )}
      </Stack>
    </motion.div>
  );
}
