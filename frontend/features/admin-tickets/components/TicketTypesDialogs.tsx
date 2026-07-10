"use client";

import {
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
  Text,
} from "@chakra-ui/react";
import React from "react";

import { TicketTypeForm } from "@/features/ticket-types/components/TicketTypeForm";
import { AdminTicketType } from "@/features/ticket-types/schemas/ticket-types.schema";
import {
  useDeactivateTicketType,
  useUpdateTicketType,
} from "@/features/ticket-types/api/ticket-types.queries";

type UpdateMutation = ReturnType<typeof useUpdateTicketType>;
type DeactivateMutation = ReturnType<typeof useDeactivateTicketType>;

interface Props {
  updateMutation: UpdateMutation;
  deactivateMutation: DeactivateMutation;
  editing: AdminTicketType | null;
  setEditing: (value: AdminTicketType | null) => void;
  deletingId: string | null;
  setDeletingId: (value: string | null) => void;
  ticketTypesList: AdminTicketType[];
}

export const TicketTypesDialogs = React.memo(function TicketTypesDialogs({
  updateMutation,
  deactivateMutation,
  editing,
  setEditing,
  deletingId,
  setDeletingId,
  ticketTypesList,
}: Props) {
  return (
    <>
      <DialogRoot
        open={!!editing}
        onOpenChange={(e) => {
          if (!e.open) setEditing(null);
        }}
      >
        <DialogBackdrop />

        <DialogPositioner>
          <DialogContent bg="gray.600" color="brand.light">
            <DialogHeader>
              <DialogTitle color="brand.light">
                Editar: {editing?.name ?? ""}
              </DialogTitle>
            </DialogHeader>

            <DialogBody>
              {editing && (
                <TicketTypeForm
                  ticketType={editing}
                  onCreate={async () => {}}
                  onUpdate={async (id, data) => {
                    await updateMutation.mutateAsync({ id, data });
                    setEditing(null);
                  }}
                  onCancel={() => setEditing(null)}
                />
              )}
            </DialogBody>

            <DialogCloseTrigger color="brand.muted" />
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>

      <DialogRoot
        open={!!deletingId}
        onOpenChange={(e) => {
          if (!e.open) setDeletingId(null);
        }}
      >
        <DialogBackdrop />

        <DialogPositioner>
          <DialogContent bg="brand.dark" color="brand.light">
            <DialogHeader>
              <DialogTitle color="brand.light">
                Desactivar tipo de entrada
              </DialogTitle>
            </DialogHeader>

            <DialogBody>
              <Text>
                ¿Desactivar{" "}
                <strong>
                  {ticketTypesList.find((t) => t.id === deletingId)?.name ?? ""}
                </strong>
                ? Los tickets existentes no se verán afectados, pero el tipo no
                estará disponible para nuevas compras.
              </Text>
            </DialogBody>

            <DialogFooter>
              <HStack gap={3}>
                <Button
                  variant="outline"
                  color="brand.light"
                  borderColor="rgba(255,255,255,0.2)"
                  _hover={{ bg: "rgba(255,255,255,0.08)" }}
                  onClick={() => setDeletingId(null)}
                >
                  Cancelar
                </Button>

                <Button
                  colorPalette="red"
                  loading={deactivateMutation.isPending}
                  onClick={async () => {
                    if (deletingId)
                      await deactivateMutation.mutateAsync(deletingId);
                    setDeletingId(null);
                  }}
                >
                  Desactivar
                </Button>
              </HStack>
            </DialogFooter>

            <DialogCloseTrigger color="brand.muted" />
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>
    </>
  );
});
