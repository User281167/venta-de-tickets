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
import React from "react";

import { TicketTypeForm } from "@/features/ticket-types/components/TicketTypeForm";

interface Props {
  showCreate: boolean;
  setShowCreate: (value: boolean) => void;
  createMutation: any;
}

export const TicketTypesHeader = React.memo(function TicketTypesHeader({
  showCreate,
  setShowCreate,
  createMutation,
}: Props) {
  return (
    <HStack justify="space-between">
      <VStack align="start" gap={1}>
        <Heading as="h1" size="lg" color="brand.light">
          Tipos de entrada
        </Heading>

        <Text color="brand.muted" fontSize="sm">
          Evento
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
});
