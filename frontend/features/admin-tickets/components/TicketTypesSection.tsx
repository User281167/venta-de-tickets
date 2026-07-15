"use client";

import { Center, Spinner, VStack } from "@chakra-ui/react";
import { TicketTypesHeader } from "./TicketTypesHeader";
import { TicketTypesGrid } from "./TicketTypesGrid";
import { TicketTypesDialogs } from "./TicketTypesDialogs";
import { TicketTypesStats } from "./TicketTypesStats";
import { useTicketTable } from "../hook/useTicketTypes";

export function TicketTypesSection() {
  const {
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
        <Spinner size="xl" color="brand.cyan" />
      </Center>
    );
  }

  return (
    <VStack align="stretch" gap={8} w="full">
      <TicketTypesHeader
        showCreate={showCreate}
        setShowCreate={setShowCreate}
        createMutation={createMutation}
      />

      <TicketTypesStats ticketTypesList={ticketTypesList} />

      <TicketTypesGrid
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
