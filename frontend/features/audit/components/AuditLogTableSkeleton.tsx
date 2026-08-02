"use client";

import { Box, Skeleton, Table } from "@chakra-ui/react";
import { tableCss } from "@/shared/components/tablecss";

const ROW_COUNT = 8;

export function AuditLogTableSkeleton() {
  return (
    <Box
      w="full"
      minW={0}
      maxW="100%"
      overflowX="auto"
      className="scrollbar-thin"
    >
      <Table.Root css={tableCss} minW="1100px">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="15%">Fecha</Table.ColumnHeader>
            <Table.ColumnHeader w="20%">Actor</Table.ColumnHeader>
            <Table.ColumnHeader w="10%">Rol</Table.ColumnHeader>
            <Table.ColumnHeader w="20%">Acción</Table.ColumnHeader>
            <Table.ColumnHeader w="12%">Entidad</Table.ColumnHeader>
            <Table.ColumnHeader w="23%">Detalle</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Array.from({ length: ROW_COUNT }).map((_, i) => (
            <Table.Row key={i}>
              <Table.Cell>
                <Skeleton h="14px" w="100px" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton h="14px" w="140px" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton h="14px" w="60px" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton h="14px" w="180px" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton h="14px" w="90px" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton h="14px" w="220px" />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
