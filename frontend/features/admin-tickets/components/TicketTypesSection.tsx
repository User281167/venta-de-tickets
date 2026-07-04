"use client";

import { Center, Spinner, Text, VStack } from "@chakra-ui/react";
import { TicketTypesHeader } from "./TicketTypesHeader";
import { TicketTypesTable } from "./TicketTypesTable";
import { TicketTypesDialogs } from "./TicketTypesDialogs";
import { useTicketTable } from "./TicketTypesState";

export function TicketTypesSection() {
  const {
    events,
    eventId,
    ticketTypes,
    isLoading,
    createMutation,
    updateMutation,
    deactivateMutation,
    editing,
    setEditing,
    showCreate,
    setShowCreate,
    deletingId,
    setDeletingId,
    ticketTypesList,
  } = useTicketTable();

  if (isLoading) {
    return (
      <Center h="full" flex={1}>
        <Spinner size="xl" color="brand.teal" />
      </Center>
    );
  }

  if (!eventId) {
    return <Text color="red.400">No hay eventos publicados.</Text>;
  }

  return (
    <VStack align="stretch" gap={6} w="full">
      <TicketTypesHeader
        events={events}
        showCreate={showCreate}
        setShowCreate={setShowCreate}
        eventId={eventId}
        createMutation={createMutation}
      />

      <TicketTypesTable
        setEditing={setEditing}
        setDeletingId={setDeletingId}
        ticketTypesList={ticketTypesList}
      />

      <TicketTypesDialogs
        eventId={eventId}
        updateMutation={updateMutation}
        deactivateMutation={deactivateMutation}
        editing={editing}
        setEditing={setEditing}
        deletingId={deletingId}
        setDeletingId={setDeletingId}
        ticketTypesList={ticketTypesList}
      />
    </VStack>
  );
}
