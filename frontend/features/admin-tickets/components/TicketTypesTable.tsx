import { Badge, Box, Button, HStack, Table, Text } from "@chakra-ui/react";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import React from "react";

import { tableCss } from "@/shared/components/tablecss";
import { AdminTicketType } from "@/features/ticket-types/schemas/ticket-types.schema";

interface Props {
  setEditing: (value: AdminTicketType | null) => void;
  setDeletingId: (value: string | null) => void;
  ticketTypesList: AdminTicketType[];
}

export const TicketTypesTable = React.memo(function TicketTypesTable({
  setEditing,
  setDeletingId,
  ticketTypesList,
}: Props) {
  return (
    <>
      {ticketTypesList.length === 0 ? (
        <Text color="brand.muted">No hay tipos de entrada registrados.</Text>
      ) : (
        <Box w="full" overflowX="auto">
          <Table.Root w="full" css={tableCss}>
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
                    <Badge
                      colorPalette={tt.isActive ? "green" : "red"}
                      size="sm"
                    >
                      {tt.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </Table.Cell>

                  <Table.Cell>
                    <HStack gap={2}>
                      <Button
                        size="sm"
                        variant="outline"
                        color="brand.light"
                        borderColor="rgba(255,255,255,0.2)"
                        _hover={{ bg: "rgba(255,255,255,0.08)" }}
                        onClick={() => setEditing(tt)}
                      >
                        <IconEdit size={16} />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        colorPalette="red"
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
    </>
  );
});
