"use client";

import {
  Box,
  Button,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  HStack,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { motion, useReducedMotion } from "framer-motion";
import type { TicketItem } from "../types/ticket.types";

type Mode = "confirm" | "reject";

interface Props {
  open: boolean;
  mode: Mode | null;
  ticket: TicketItem | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onReject: () => void;
}

const COPY: Record<
  Mode,
  {
    title: string;
    body: string;
    buttonLabel: string;
    buttonBg: string;
    buttonHoverBg: string;
    borderColor: string;
  }
> = {
  confirm: {
    title: "Confirmar ingreso",
    body: "Vas a autorizar el ingreso del portador del QR. Una vez confirmado, el validador podrá registrar la entrada del asistente en la puerta.",
    buttonLabel: "Confirmar",
    buttonBg: "brand.cyan",
    buttonHoverBg: "#00cfe6",
    borderColor: "rgba(0,229,255,0.3)",
  },
  reject: {
    title: "Rechazar ingreso",
    body: "El portador del QR no podrá ingresar. El ticket volverá a estado Pagado y el validador podrá procesarlo de nuevo si lo decides.",
    buttonLabel: "Rechazar",
    buttonBg: "red.500",
    buttonHoverBg: "red.600",
    borderColor: "rgba(239,68,68,0.35)",
  },
};

export function ConfirmTicketDialog({
  open,
  mode,
  ticket,
  isPending,
  onClose,
  onConfirm,
  onReject,
}: Props) {
  const reduced = useReducedMotion();
  if (!mode || !ticket) return null;

  const c = COPY[mode];
  const primary = mode === "confirm" ? onConfirm : onReject;

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      placement="center"
      size="md"
    >
      <DialogBackdrop bg="rgba(2,4,20,0.85)" backdropFilter="blur(6px)" />

      <DialogPositioner>
        <DialogContent
          bg="brand.panel"
          color="brand.light"
          border="1px solid"
          borderColor={c.borderColor}
          borderRadius="2xl"
          maxW="440px"
          w="full"
          mx={4}
          asChild
        >
          <motion.div
            initial={reduced ? {} : { opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="3px"
              bg={
                mode === "confirm"
                  ? "linear-gradient(90deg, #ff0f7b, #00e5ff)"
                  : "linear-gradient(90deg, #ff0f7b, #ef4444)"
              }
              borderTopRadius="2xl"
            />

            <DialogHeader pt={6}>
              <HStack gap={3}>
                <Box
                  w={10}
                  h={10}
                  borderRadius="xl"
                  bg={
                    mode === "confirm"
                      ? "rgba(0,229,255,0.1)"
                      : "rgba(239,68,68,0.1)"
                  }
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color={mode === "confirm" ? "brand.cyan" : "red.400"}
                >
                  {mode === "confirm" ? (
                    <IconCheck size={20} />
                  ) : (
                    <IconX size={20} />
                  )}
                </Box>

                <Stack gap={0}>
                  <DialogTitle color="white" fontSize="lg" fontWeight="bold">
                    {c.title}
                  </DialogTitle>

                  <Text color="brand.muted" fontSize="xs">
                    {ticket.ticketType.name} · {ticket.ticketCode}
                  </Text>
                </Stack>
              </HStack>
            </DialogHeader>

            <DialogBody>
              <Text color="brand.light" fontSize="sm" lineHeight="1.6">
                {c.body}
              </Text>
            </DialogBody>

            <DialogFooter gap={2}>
              <Button
                variant="outline"
                color="white"
                borderColor="rgba(255,255,255,0.2)"
                _hover={{ bg: "rgba(255,255,255,0.06)" }}
                onClick={onClose}
                disabled={isPending}
              >
                Cancelar
              </Button>

              <Button
                bg={c.buttonBg}
                color={mode === "confirm" ? "brand.dark" : "white"}
                fontWeight="bold"
                _hover={{ bg: c.buttonHoverBg }}
                _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
                onClick={primary}
                disabled={isPending}
              >
                {isPending ? <Spinner size="sm" /> : null}
                {c.buttonLabel}
              </Button>
            </DialogFooter>

            <DialogCloseTrigger
              color="brand.muted"
              _hover={{ color: "white" }}
            />
          </motion.div>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
