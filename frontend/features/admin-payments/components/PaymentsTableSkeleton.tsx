"use client";

import { Box, Skeleton, Table } from "@chakra-ui/react";
import { tableCss } from "@/shared/components/tablecss";

const ROWS = 5;

export function PaymentsTableSkeleton() {
  return (
    <Box w="full" overflow="auto">
      <Table.Root css={tableCss}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="18%">Fecha</Table.ColumnHeader>
            <Table.ColumnHeader w="18%">Usuario</Table.ColumnHeader>
            <Table.ColumnHeader w="18%">Correo</Table.ColumnHeader>
            <Table.ColumnHeader w="10%">Tickets</Table.ColumnHeader>
            <Table.ColumnHeader w="14%">Total</Table.ColumnHeader>
            <Table.ColumnHeader w="12%">Estado</Table.ColumnHeader>
            <Table.ColumnHeader w="10%">ID</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {Array.from({ length: ROWS }).map((_, i) => (
            <Table.Row key={i}>
              <Table.Cell><Skeleton h="5" w="20" /></Table.Cell>
              <Table.Cell><Skeleton h="5" w="28" /></Table.Cell>
              <Table.Cell><Skeleton h="5" w="36" /></Table.Cell>
              <Table.Cell><Skeleton h="5" w="8" /></Table.Cell>
              <Table.Cell><Skeleton h="5" w="16" /></Table.Cell>
              <Table.Cell><Skeleton h="5" w="20" /></Table.Cell>
              <Table.Cell><Skeleton h="5" w="24" /></Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
