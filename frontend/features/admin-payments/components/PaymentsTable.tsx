"use client";

import { Table } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { tableCss } from "@/shared/components/tablecss";
import type { PaymentListRow } from "../schemas/admin-payments.schema";
import { useCallback } from "react";
import { PAYMENT_STATUS_LABELS } from "@/shared/utils/constants";
import { formatCurrency, formatDate } from "@/shared/utils/formats";

export function PaymentsTable({ payments }: { payments: PaymentListRow[] }) {
  const router = useRouter();

  const handleRowClick = useCallback(
    (id: string) => {
      router.push(`/admin/pagos/${id}`);
    },
    [router],
  );

  return (
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
        {payments.map((p) => (
          <Table.Row
            key={p.id}
            cursor="pointer"
            _hover={{ bg: "gray.50" }}
            onClick={() => handleRowClick(p.id)}
          >
            <Table.Cell>{formatDate(p.createdAt)}</Table.Cell>
            <Table.Cell>{p.user.fullName}</Table.Cell>
            <Table.Cell>{p.user.email}</Table.Cell>
            <Table.Cell>{p.ticketCount}</Table.Cell>
            <Table.Cell>{formatCurrency(p.totalCents)}</Table.Cell>
            <Table.Cell>
              {PAYMENT_STATUS_LABELS[p.status] ?? p.status}
            </Table.Cell>

            <Table.Cell fontFamily="mono" fontSize="xs">
              {p.id.slice(0, 8)}...
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
