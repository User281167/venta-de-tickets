"use client";

import { Center, Spinner, Text, VStack } from "@chakra-ui/react";
import { TicketTypesHeader } from "./TicketTypesHeader";
import { TicketTypesTable } from "./TicketTypesTable";
import { TicketTypesDialogs } from "./TicketTypesDialogs";
import { useTicketTable } from "../hook/useTicketTypes";

export function TicketTypesSection() {
  const {
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

  return (
    <VStack align="stretch" gap={6} w="full">
      <TicketTypesHeader
        showCreate={showCreate}
        setShowCreate={setShowCreate}
        createMutation={createMutation}
      />

      <TicketTypesTable
        setEditing={setEditing}
        setDeletingId={setDeletingId}
        ticketTypesList={ticketTypesList}
      />

      <TicketTypesDialogs
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
