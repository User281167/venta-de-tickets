import { Badge, Table } from "@chakra-ui/react";
import React from "react";

import { UserRow } from "../api/admin-users.queries";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface Props {
  user: UserRow;
}

export const UserTableItem = React.memo(function ({ user }: Props) {
  return (
    <Table.Row key={user.id}>
      <Table.Cell>{user.fullName}</Table.Cell>
      <Table.Cell>{user.email}</Table.Cell>
      <Table.Cell>{formatDate(user.createdAt)}</Table.Cell>

      <Table.Cell textAlign="center">
        <Badge
          colorPalette={user.onboardingSurveyDone ? "green" : "yellow"}
          size="sm"
        >
          {user.onboardingSurveyDone ? "Completa" : "Pendiente"}
        </Badge>
      </Table.Cell>
    </Table.Row>
  );
});
