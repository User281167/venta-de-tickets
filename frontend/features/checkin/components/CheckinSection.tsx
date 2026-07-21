"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Center,
  HStack,
  Heading,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import { IconRefresh } from "@tabler/icons-react";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/api-error";
import {
  useAllowEntry,
  useConfirmEntry,
  useRequestConfirmation,
} from "../api/checkin.queries";
import type { CheckerAction } from "../schemas/checkin.schema";

import { ActionButtons } from "./ActionButtons";
import { ConfirmationPendingOverlay } from "./ConfirmationPendingOverlay";
import { ConfirmationSentModal } from "./ConfirmationSentModal";
import { QrScanCamera } from "./QrScanner";
import { TicketSummaryCard } from "./TicketSummaryCard";
import { useCheckinSession } from "../hooks/useCheckinSession";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_QR: "QR inválido o expirado",
  NOT_FOUND: "Ticket no encontrado",
  TICKET_NOT_AVAILABLE: "Ticket no disponible para esta acción",
  CONFLICT: "Este ticket ya cambió de estado. Vuelve a escanearlo.",
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

  const [confirmationSentOpen, setConfirmationSentOpen] = useState(false);

  const {
    currentTicket,
    isScanningRequest,
    error,
    scan,
    clearSession,
    setTicketStatus,
    handleActionSuccess,
  } = useCheckinSession();

  const confirmEntryMutation = useConfirmEntry();
  const requestConfirmationMutation = useRequestConfirmation();
  const allowEntryMutation = useAllowEntry();

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

  const wrapWithErrorToast = (
    mutation: typeof confirmEntryMutation,
  ): typeof confirmEntryMutation => ({
    ...mutation,
    mutate: (input, opts) => {
      mutation.mutate(input, {
        ...opts,
        onError: (err, _vars, _ctx, _mutation) => {
          toast.error(messageFromError(err));
          opts?.onError?.(err, _vars, _ctx, _mutation);
        },
      });
    },
  });

  const confirmEntry = wrapWithErrorToast(confirmEntryMutation);
  const requestConfirmation = wrapWithErrorToast(requestConfirmationMutation);
  const allowEntry = wrapWithErrorToast(allowEntryMutation);

  const onActionSuccess = (action: CheckerAction) => {
    const result = handleActionSuccess(action);
    const msg = ACTION_MESSAGES[action];

    if (action === "request_confirmation") {
      setTicketStatus("pending_confirmation", []);
      setConfirmationSentOpen(true);
    } else {
      if (msg.description) {
        toast.success(msg.title, { description: msg.description });
      } else {
        toast.success(msg.title);
      }
    }

    if (result.kind === "auto-clear") {
      if (autoClearRef.current) clearTimeout(autoClearRef.current);

      autoClearRef.current = setTimeout(() => {
        clearSession();
      }, AUTO_CLEAR_DELAY_MS);
    }
  };

  const showCamera = !currentTicket;
  const showPendingOverlay = currentTicket?.status === "pending_confirmation";

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ width: "100%" }}
    >
      <Stack gap={6} w="full" maxW="480px" mx="auto">
        {showCamera ? (
          <>
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
              <QrScanCamera onScan={scan} />

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
          </>
        ) : (
          <>
            <Stack gap={1}>
              <Text
                color="brand.cyan"
                fontSize="xs"
                fontWeight="black"
                textTransform="uppercase"
                letterSpacing="0.15em"
              >
                Asistente
              </Text>

              <Heading as="h2" size="xl" color="white" lineHeight="1.1">
                {currentTicket?.attendeeName}
              </Heading>
            </Stack>

            <Box position="relative">
              <TicketSummaryCard ticket={currentTicket!} />

              {showPendingOverlay && (
                <ConfirmationPendingOverlay
                  attendeeName={currentTicket!.attendeeName}
                />
              )}
            </Box>

            {showPendingOverlay ? (
              <Button
                w="full"
                size="lg"
                bg="brand.cyan"
                color="brand.dark"
                fontWeight="bold"
                _hover={{ bg: "#00cfe6" }}
                onClick={clearSession}
              >
                <IconRefresh size={18} />
                Volver al scanner
              </Button>
            ) : (
              <>
                <ActionButtons
                  ticket={currentTicket!}
                  confirmEntry={confirmEntry}
                  requestConfirmation={requestConfirmation}
                  allowEntry={allowEntry}
                  onSuccess={onActionSuccess}
                />

                <Button
                  w="full"
                  size="md"
                  variant="outline"
                  color="white"
                  borderColor="rgba(255,255,255,0.2)"
                  _hover={{ bg: "rgba(255,255,255,0.06)" }}
                  onClick={clearSession}
                >
                  <IconRefresh size={16} />
                  Escanear otro
                </Button>
              </>
            )}

            <HStack
              gap={1}
              justify="center"
              color="brand.muted"
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="0.1em"
            >
              <Box w="6px" h="6px" borderRadius="full" bg="brand.cyan" />
              <Text>Sesión activa — la cámara está liberada</Text>
            </HStack>
          </>
        )}
      </Stack>

      <ConfirmationSentModal
        open={confirmationSentOpen}
        onClose={() => setConfirmationSentOpen(false)}
      />
    </motion.div>
  );
}
