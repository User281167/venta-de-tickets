"use client";

import { Badge, Box, Table, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { tableCss } from "@/shared/components/tablecss";
import type { PaymentListRow } from "../schemas/admin-payments.schema";
import { useCallback } from "react";
import { PAYMENT_STATUS_LABELS } from "@/shared/utils/constants";
import { formatCurrency, formatDate } from "@/shared/utils/formats";

const STATUS_COLORS: Record<string, string> = {
  pending: "#eab308",
  completed: "#22c55e",
  failed: "#ef4444",
  refunded: "#6b7280",
};

export function PaymentsTable({ payments }: { payments: PaymentListRow[] }) {
  const router = useRouter();

  const handleRowClick = useCallback(
    (id: string) => {
      router.push(`/admin/pagos/${id}`);
    },
    [router],
  );

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
          {payments.map((p) => {
            const statusColor = STATUS_COLORS[p.status] ?? "#6b7280";
            const statusLabel = PAYMENT_STATUS_LABELS[p.status] ?? p.status;

            return (
              <Table.Row
                key={p.id}
                cursor="pointer"
                _hover={{ bg: "rgba(255,255,255,0.03)" }}
                transition="background 0.2s ease"
                onClick={() => handleRowClick(p.id)}
              >
                <Table.Cell>
                  <Text color="brand.muted" fontSize="sm">
                    {formatDate(p.createdAt)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text color="white" fontWeight="bold" fontSize="sm">
                    {p.user.fullName}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text color="brand.muted" fontSize="sm">
                    {p.user.email}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text color="white" fontSize="sm">
                    {p.ticketCount}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text color="white" fontWeight="black" fontSize="sm">
                    {formatCurrency(p.totalCents)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    bg={`${statusColor}18`}
                    border={`1px solid ${statusColor}33`}
                    color={statusColor}
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {statusLabel}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text
                    fontFamily="mono"
                    fontSize="xs"
                    color="brand.muted"
                  >
                    {p.id.slice(0, 8)}...
                  </Text>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
