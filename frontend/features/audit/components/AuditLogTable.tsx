"use client";

import { Badge, Box, Table, Text } from "@chakra-ui/react";
import { tableCss } from "@/shared/components/tablecss";
import { formatDate } from "@/shared/utils/formats";
import type { AuditLogEntry } from "../types";

const ENTITY_TYPE_COLORS: Record<string, string> = {
  TicketType: "#38bdf8",
  Ticket: "#a78bfa",
  Payment: "#34d399",
  DiscountCode: "#fbbf24",
  User: "#f472b6",
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: "#f43f5e",
  admin: "#fb923c",
  checker: "#22d3ee",
  client: "#a3a3a3",
  system: "#71717a",
  unknown: "#71717a",
};

function formatMetadata(entry: AuditLogEntry): string {
  if (!entry.metadata || Object.keys(entry.metadata).length === 0) {
    return "—";
  }

  const parts: string[] = [];
  for (const [key, value] of Object.entries(entry.metadata)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "object") {
      parts.push(`${key}: ${JSON.stringify(value)}`);
    } else {
      parts.push(`${key}: ${String(value)}`);
    }
  }
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function AuditLogTable({ entries }: { entries: AuditLogEntry[] }) {
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
          {entries.map((entry) => {
            const entityColor =
              ENTITY_TYPE_COLORS[entry.entityType] ?? "#a3a3a3";
            const roleColor = ROLE_COLORS[entry.actorRole] ?? "#a3a3a3";

            return (
              <Table.Row
                key={entry.id}
                _hover={{ bg: "rgba(255,255,255,0.03)" }}
                transition="background 0.2s ease"
              >
                <Table.Cell>
                  <Text color="brand.muted" fontSize="sm">
                    {formatDate(entry.createdAt)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text color="white" fontWeight="bold" fontSize="sm">
                    {entry.actorName ?? entry.actorId}
                  </Text>
                  {entry.actorCedula && (
                    <Text color="brand.muted" fontSize="xs">
                      CC {entry.actorCedula}
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    bg={`${roleColor}18`}
                    border={`1px solid ${roleColor}33`}
                    color={roleColor}
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="lowercase"
                  >
                    {entry.actorRole}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text color="white" fontSize="sm" fontFamily="mono">
                    {entry.action}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    bg={`${entityColor}18`}
                    border={`1px solid ${entityColor}33`}
                    color={entityColor}
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {entry.entityType}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text
                    color="brand.muted"
                    fontSize="xs"
                    fontFamily="mono"
                    lineClamp={2}
                  >
                    {formatMetadata(entry)}
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
