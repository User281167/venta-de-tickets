"use client";

import {
  Button,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { IconPlus } from "@tabler/icons-react";

import { TicketTypeForm } from "@/features/ticket-types/components/TicketTypeForm";
import { EventSummary } from "@/features/events/api/events.endpoints";

interface Props {
  events: EventSummary[] | undefined;
  showCreate: boolean;
  setShowCreate: (value: boolean) => void;
  eventId: string;
  createMutation: any;
}

export function TicketTypesHeader({
  events,
  showCreate,
  setShowCreate,
  eventId,
  createMutation,
}: Props) {
  return (
    <HStack justify="space-between">
      <VStack align="start" gap={1}>
        <Heading as="h1" size="lg" color="brand.light">
          Tipos de entrada
        </Heading>

        <Text color="brand.muted" fontSize="sm">
          {events?.[0]?.title ?? "Evento"}
        </Text>
      </VStack>

      <Button
        bg="brand.violet"
        color="white"
        onClick={() => setShowCreate(true)}
      >
        <IconPlus size={18} />
        Nuevo tipo
      </Button>

      <DialogRoot open={showCreate} onOpenChange={(e) => setShowCreate(e.open)}>
        <DialogBackdrop />

        <DialogPositioner>
          <DialogContent bg="gray.600" color="brand.light">
            <DialogHeader>
              <DialogTitle color="brand.light">
                Crear tipo de entrada
              </DialogTitle>
            </DialogHeader>

            <DialogBody>
              <TicketTypeForm
                eventId={eventId}
                onCreate={async (data) => {
                  await createMutation.mutateAsync(data);
                  setShowCreate(false);
                }}
                onCancel={() => setShowCreate(false)}
              />
            </DialogBody>
            <DialogCloseTrigger color="brand.muted" />
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>
    </HStack>
  );
}
