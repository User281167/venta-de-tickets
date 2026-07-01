"use client";

import { useState } from "react";
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
  Heading,
  HStack,
  Spinner,
  Table,
  Text,
  VStack,
  Badge,
  Center,
} from "@chakra-ui/react";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { usePublishedEvents } from "@/features/events/api/events.queries";
import {
  useAdminTicketTypes,
  useCreateTicketType,
  useUpdateTicketType,
  useDeactivateTicketType,
} from "@/features/ticket-types/api/ticket-types.queries";
import { TicketTypeForm } from "@/features/ticket-types/components/TicketTypeForm";
import type { AdminTicketType } from "@/features/ticket-types/schemas/ticket-types.schema";

export default function AdminTicketTypesPage() {
  const { data: events, isLoading: loadingEvents } = usePublishedEvents();
  const eventId = events?.[0]?.id ?? "";
  const { data: ticketTypes, isLoading: loadingTypes } = useAdminTicketTypes(eventId);
  const createMutation = useCreateTicketType(eventId);
  const updateMutation = useUpdateTicketType(eventId);
  const deactivateMutation = useDeactivateTicketType(eventId);

  const [editing, setEditing] = useState<AdminTicketType | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isLoading = loadingEvents || loadingTypes;

  if (isLoading) {
    return (
      <Center h="full" flex={1}>
        <Spinner size="xl" color="#76ABAE" />
      </Center>
    );
  }

  if (!eventId) {
    return <Text color="red.500">No hay eventos publicados.</Text>;
  }

  const ticketTypesList = ticketTypes ?? [];

  return (
    <Box w="full">
      <HStack justify="space-between" mb={6}>
        <VStack align="start" gap={1}>
          <Heading as="h1" size="lg">
            Tipos de entrada
          </Heading>
          <Text color="gray.500" fontSize="sm">
            {events?.[0]?.title ?? "Evento"}
          </Text>
        </VStack>

        <Button colorPalette="teal" onClick={() => setShowCreate(true)}>
          <IconPlus size={18} />
          Nuevo tipo
        </Button>

        <DialogRoot open={showCreate} onOpenChange={(e) => setShowCreate(e.open)}>
          <DialogBackdrop />
          <DialogPositioner>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear tipo de entrada</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <TicketTypeForm
                eventId={eventId}
                onCreate={async (data) => { await createMutation.mutateAsync(data); }}
                onCancel={() => setShowCreate(false)}
              />
            </DialogBody>
            <DialogCloseTrigger />
          </DialogContent>
          </DialogPositioner>
        </DialogRoot>
      </HStack>

      {ticketTypesList.length === 0 ? (
        <Text color="gray.500">No hay tipos de entrada registrados.</Text>
      ) : (
        <Box overflowX="auto" w="full">
          <Table.Root w="full">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Nombre</Table.ColumnHeader>
                <Table.ColumnHeader>Precio</Table.ColumnHeader>
                <Table.ColumnHeader>Disponibles</Table.ColumnHeader>
                <Table.ColumnHeader>Máx./persona</Table.ColumnHeader>
                <Table.ColumnHeader>Estado</Table.ColumnHeader>
                <Table.ColumnHeader w="120px">Acciones</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {ticketTypesList.map((tt) => (
                <Table.Row key={tt.id}>
                  <Table.Cell fontWeight="medium">{tt.name}</Table.Cell>
                  <Table.Cell>
                    ${Number(tt.price).toLocaleString("es-CO")}
                  </Table.Cell>
                  <Table.Cell>
                    {tt.quantityTotal - tt.quantitySold} / {tt.quantityTotal}
                  </Table.Cell>
                  <Table.Cell>{tt.maxPerUser ?? "—"}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={tt.isActive ? "green" : "red"} size="sm">
                      {tt.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <HStack gap={2}>
                      <Button size="sm" variant="outline" onClick={() => setEditing(tt)}>
                        <IconEdit size={16} />
                      </Button>
                      <Button
                        size="sm" variant="outline" colorPalette="red"
                        onClick={() => setDeletingId(tt.id)}
                        disabled={!tt.isActive}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      <DialogRoot open={!!editing} onOpenChange={(e) => { if (!e.open) setEditing(null); }}>
        <DialogBackdrop />
        <DialogPositioner>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar: {editing?.name ?? ""}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {editing && (
              <TicketTypeForm
                ticketType={editing}
                eventId={eventId}
                onCreate={async () => {}}
                onUpdate={async (id, data) => {
                  await updateMutation.mutateAsync({ id, data });
                }}
                onCancel={() => setEditing(null)}
              />
            )}
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
          </DialogPositioner>
      </DialogRoot>

      <DialogRoot open={!!deletingId} onOpenChange={(e) => { if (!e.open) setDeletingId(null); }}>
        <DialogBackdrop />
        <DialogPositioner>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desactivar tipo de entrada</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text>
              ¿Desactivar <strong>{ticketTypesList.find((t) => t.id === deletingId)?.name ?? ""}</strong>?
              Los tickets existentes no se verán afectados, pero el tipo no
              estará disponible para nuevas compras.
            </Text>
          </DialogBody>
          <DialogFooter>
            <HStack gap={3}>
              <Button variant="outline" onClick={() => setDeletingId(null)}>
                Cancelar
              </Button>
              <Button
                colorPalette="red"
                loading={deactivateMutation.isPending}
                onClick={async () => {
                  if (deletingId) await deactivateMutation.mutateAsync(deletingId);
                  setDeletingId(null);
                }}
              >
                Desactivar
              </Button>
            </HStack>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
          </DialogPositioner>
      </DialogRoot>
    </Box>
  );
}
