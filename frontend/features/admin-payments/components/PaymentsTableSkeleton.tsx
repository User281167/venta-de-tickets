"use client";

import { Box, Skeleton, Table } from "@chakra-ui/react";
import { tableCss } from "@/shared/components/tablecss";

const ROWS = 5;

export function PaymentsTableSkeleton() {
  return (
    <Box
      w="full"
      minW={0}
      maxW="100%"
      overflowX="auto"
      className="scrollbar-thin"
    >
      <Table.Root css={tableCss} minW="900px">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="16%">Fecha</Table.ColumnHeader>
            <Table.ColumnHeader w="14%">Usuario</Table.ColumnHeader>
            <Table.ColumnHeader w="20%">Correo</Table.ColumnHeader>
            <Table.ColumnHeader w="10%">Tickets</Table.ColumnHeader>
            <Table.ColumnHeader w="14%">Total</Table.ColumnHeader>
            <Table.ColumnHeader w="14%">Estado</Table.ColumnHeader>
            <Table.ColumnHeader w="12%">ID</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {Array.from({ length: ROWS }).map((_, i) => (
            <Table.Row key={i}>
              <Table.Cell>
                <Skeleton h="5" w="28" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton h="5" w="20" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton h="5" w="40" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton h="5" w="8" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton h="5" w="20" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton h="5" w="24" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton h="5" w="20" />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
