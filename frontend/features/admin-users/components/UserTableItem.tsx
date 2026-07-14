import { Button, HStack, Table } from "@chakra-ui/react";
import React from "react";

import { UserRow } from "../api/admin-users.queries";
import { IconCash, IconEdit } from "@tabler/icons-react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface Props {
  user: UserRow;
  onEdit: (user: UserRow) => void;
  onAddPayment: (user: UserRow) => void;
}

export const UserTableItem = React.memo(function ({
  user,
  onEdit,
  onAddPayment,
}: Props) {
  return (
    <Table.Row key={user.id}>
      <Table.Cell>{user.fullName}</Table.Cell>
      <Table.Cell>{user.email}</Table.Cell>
      <Table.Cell>{formatDate(user.createdAt)}</Table.Cell>

      <Table.Cell textAlign="center">
        <HStack justify="center" gap={2}>
          <Button
            size="sm"
            variant="outline"
            color="white"
            _hover={{ color: "black" }}
            onClick={() => onAddPayment(user)}
            title="Pago manual"
          >
            <IconCash size={16} />
          </Button>

          <Button
            size="sm"
            variant="outline"
            color="white"
            _hover={{ color: "black" }}
            onClick={() => onEdit(user)}
          >
            <IconEdit size={16} />
          </Button>
        </HStack>
      </Table.Cell>
    </Table.Row>
  );
});
