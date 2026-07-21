"use client";

import { Button, HStack, Spinner } from "@chakra-ui/react";
import { IconCheck, IconMessage, IconShieldCheck } from "@tabler/icons-react";
import type { UseMutationResult } from "@tanstack/react-query";
import type {
  CheckerAction,
  TicketActionInput,
  TicketSummary,
} from "../schemas/checkin.schema";

interface ActionMutation {
  isPending: boolean;
  mutate: UseMutationResult<
    void,
    Error,
    TicketActionInput
  >["mutate"];
}

interface Props {
  ticket: TicketSummary;
  confirmEntry: ActionMutation;
  requestConfirmation: ActionMutation;
  allowEntry: ActionMutation;
  onSuccess: (action: CheckerAction) => void;
}

const ORDER: CheckerAction[] = [
  "confirm_entry_direct",
  "request_confirmation",
  "allow_entry",
];

export function ActionButtons({
  ticket,
  confirmEntry,
  requestConfirmation,
  allowEntry,
  onSuccess,
}: Props) {
  const isPending =
    confirmEntry.isPending ||
    requestConfirmation.isPending ||
    allowEntry.isPending;

  if (ticket.allowedActions.length === 0) return null;

  const sorted = ORDER.filter((a) => ticket.allowedActions.includes(a));

  return (
    <HStack gap={2} wrap="wrap" w="full">
      {sorted.map((action) => {
        if (action === "confirm_entry_direct") {
          return (
            <Button
              key={action}
              flex={1}
              minW="180px"
              bg="brand.cyan"
              color="brand.dark"
              fontWeight="bold"
              _hover={{ bg: "#00cfe6" }}
              _disabled={{ bg: "rgba(0,229,255,0.4)", cursor: "not-allowed" }}
              onClick={() =>
                confirmEntry.mutate(
                  { ticketId: ticket.ticketId },
                  { onSuccess: () => onSuccess(action) },
                )
              }
              disabled={isPending}
            >
              {confirmEntry.isPending ? (
                <Spinner size="sm" />
              ) : (
                <IconCheck size={18} />
              )}
              Confirmar entrada
            </Button>
          );
        }

        if (action === "request_confirmation") {
          return (
            <Button
              key={action}
              flex={1}
              minW="180px"
              variant="outline"
              color="white"
              borderColor="brand.cyan"
              _hover={{ bg: "rgba(0,229,255,0.08)" }}
              _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
              onClick={() =>
                requestConfirmation.mutate(
                  { ticketId: ticket.ticketId },
                  { onSuccess: () => onSuccess(action) },
                )
              }
              disabled={isPending}
            >
              {requestConfirmation.isPending ? (
                <Spinner size="sm" />
              ) : (
                <IconMessage size={18} />
              )}
              Pedir confirmación
            </Button>
          );
        }

        return (
          <Button
            key={action}
            flex={1}
            minW="180px"
            bg="brand.violet"
            color="white"
            fontWeight="bold"
            _hover={{ bg: "#6a2be2" }}
            _disabled={{ bg: "rgba(124,60,255,0.4)", cursor: "not-allowed" }}
            onClick={() =>
              allowEntry.mutate(
                { ticketId: ticket.ticketId },
                { onSuccess: () => onSuccess(action) },
              )
            }
            disabled={isPending}
          >
            {allowEntry.isPending ? (
              <Spinner size="sm" />
            ) : (
              <IconShieldCheck size={18} />
            )}
            Permitir ingreso
          </Button>
        );
      })}
    </HStack>
  );
}
