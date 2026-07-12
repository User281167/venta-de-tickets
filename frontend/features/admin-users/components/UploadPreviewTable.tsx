"use client";

import { Box, Flex, Icon, Table, Text } from "@chakra-ui/react";
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import type { ParsedExcelRow } from "../schemas/admin-user.schema";
import { tableCss } from "@/shared/components/tablecss";

type RowError = {
  rowIndex: number;
  field: string;
  message: string;
};

type UploadPreviewTableProps = {
  rows: ParsedExcelRow[];
  errors: RowError[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
};

function getRowErrors(rowIndex: number, errors: RowError[]): RowError[] {
  return errors.filter((e) => e.rowIndex === rowIndex);
}

export function UploadPreviewTable({
  rows,
  errors,
  totalRows,
  validCount,
  invalidCount,
}: UploadPreviewTableProps) {
  if (totalRows === 0) {
    return null;
  }

  return (
    <Box w="full" overflowX="auto">
      <Table.Root variant="line" striped css={tableCss}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>#</Table.ColumnHeader>
            <Table.ColumnHeader>Nombre completo</Table.ColumnHeader>
            <Table.ColumnHeader>Cédula</Table.ColumnHeader>
            <Table.ColumnHeader>Teléfono</Table.ColumnHeader>
            <Table.ColumnHeader>Correo electrónico</Table.ColumnHeader>
            <Table.ColumnHeader>Contraseña</Table.ColumnHeader>
            <Table.ColumnHeader>Estado</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {rows.map((row, idx) => {
            const rowErrors = getRowErrors(idx, errors);
            const isValid = rowErrors.length === 0;

            return (
              <Table.Row key={idx} bg={isValid ? undefined : "red.50"}>
                <Table.Cell>{idx + 1}</Table.Cell>
                <Table.Cell>{row.fullName}</Table.Cell>
                <Table.Cell>{row.cedula ?? "-"}</Table.Cell>
                <Table.Cell>{row.phone ?? "-"}</Table.Cell>
                <Table.Cell color={isValid ? undefined : "red.600"}>
                  {row.email}
                </Table.Cell>

                <Table.Cell>
                  {"•".repeat(Math.min(row.password.length, 8))}
                </Table.Cell>

                <Table.Cell>
                  {isValid ? (
                    <Flex align="center" gap={1} color="green.600">
                      <Icon as={IconCircleCheck} boxSize={5} />
                      <Text fontSize="sm">Válida</Text>
                    </Flex>
                  ) : (
                    <Box>
                      <Flex align="center" gap={1} color="red.600">
                        <Icon as={IconCircleX} boxSize={5} />
                        <Text fontSize="sm">Inválida</Text>
                      </Flex>

                        {rowErrors.map((re, i) => (
                        <Text key={i} fontSize="xs" color="red.500" mt={0.5}>
                          {re.field}: {re.message}
                        </Text>
                      ))}
                    </Box>
                  )}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>

      <Flex justify="space-between" align="center" mt={4} px={2}>
        <Text fontSize="sm" color="gray.600">
          {validCount} de {totalRows} filas válidas
        </Text>

        {invalidCount > 0 && (
          <Text fontSize="sm" color="red.600">
            {invalidCount} fila{invalidCount !== 1 ? "s" : ""} con errores
          </Text>
        )}
      </Flex>
    </Box>
  );
}
