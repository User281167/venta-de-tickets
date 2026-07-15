"use client";

import {
  Badge,
  Box,
  Button,
  HStack,
  IconButton,
  Table,
  Text,
} from "@chakra-ui/react";
import { IconCash, IconEdit, IconTable } from "@tabler/icons-react";
import type { UserRow } from "../api/admin-users.queries";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  super_admin: "Super Admin",
  checker: "Checker",
  client: "Cliente",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "#ff0f7b",
  super_admin: "#ff0f7b",
  checker: "#00e5ff",
  client: "#aeb8d8",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface UserTableViewProps {
  users: UserRow[];
  onEdit: (user: UserRow) => void;
  onAddPayment: (user: UserRow) => void;
}

export function UserTableView({
  users,
  onEdit,
  onAddPayment,
}: UserTableViewProps) {
  if (users.length === 0) {
    return (
      <Box textAlign="center" py={16}>
        <Box
          w={20}
          h={20}
          mx="auto"
          borderRadius="full"
          bg="rgba(255,255,255,0.04)"
          border="1px solid rgba(255,255,255,0.08)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={6}
        >
          <IconTable size={36} color="#00e5ff" />
        </Box>
        <Text color="white" fontSize="xl" fontWeight="bold" mb={2}>
          No se encontraron usuarios
        </Text>
        <Text color="brand.muted" maxW="400px" mx="auto">
          Intenta con otro término de búsqueda o crea un usuario nuevo.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      overflowX="auto"
      borderRadius="2xl"
      border="1px solid rgba(255,255,255,0.08)"
      css={{
        "&::-webkit-scrollbar": {
          height: "8px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "rgba(255,255,255,0.04)",
          borderRadius: "9999px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(255,255,255,0.16)",
          borderRadius: "9999px",
        },
      }}
    >
      <Table.Root minW="800px" variant="outline" size="md">
        <Table.Header>
          <Table.Row bg="rgba(255,255,255,0.03)">
            <Table.ColumnHeader color="white" fontWeight="bold">
              Nombre
            </Table.ColumnHeader>
            <Table.ColumnHeader color="white" fontWeight="bold">
              Correo
            </Table.ColumnHeader>
            <Table.ColumnHeader color="white" fontWeight="bold">
              Rol
            </Table.ColumnHeader>
            <Table.ColumnHeader color="white" fontWeight="bold">
              Estado
            </Table.ColumnHeader>
            <Table.ColumnHeader color="white" fontWeight="bold">
              Registro
            </Table.ColumnHeader>
            <Table.ColumnHeader color="white" fontWeight="bold" textAlign="center">
              Acciones
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {users.map((user) => {
            const role = user.role ?? "client";
            const roleColor = ROLE_COLORS[role] ?? ROLE_COLORS.client;
            const roleLabel = ROLE_LABELS[role] ?? role;

            return (
              <Table.Row
                key={user.id}
                _hover={{ bg: "rgba(255,255,255,0.03)" }}
                transition="background 0.2s ease"
              >
                <Table.Cell>
                  <Text color="white" fontWeight="bold">
                    {user.fullName}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text color="brand.muted" fontSize="sm">
                    {user.email}
                  </Text>
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
                  >
                    {roleLabel}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    bg={
                      user.isActive
                        ? "rgba(34,197,94,0.12)"
                        : "rgba(239,68,68,0.12)"
                    }
                    border={
                      user.isActive
                        ? "1px solid rgba(34,197,94,0.3)"
                        : "1px solid rgba(239,68,68,0.3)"
                    }
                    color={user.isActive ? "#22c55e" : "#ef4444"}
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {user.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text color="brand.muted" fontSize="sm">
                    {formatDate(user.createdAt)}
                  </Text>
                </Table.Cell>
                <Table.Cell textAlign="center">
                  <HStack justify="center" gap={2}>
                    <IconButton
                      aria-label="Registrar pago"
                      size="sm"
                      variant="outline"
                      color="white"
                      borderColor="rgba(255,255,255,0.16)"
                      borderRadius="lg"
                      onClick={() => onAddPayment(user)}
                      _hover={{ bg: "rgba(255,255,255,0.06)", borderColor: "brand.cyan" }}
                    >
                      <IconCash size={16} />
                    </IconButton>
                    <IconButton
                      aria-label="Editar usuario"
                      size="sm"
                      variant="outline"
                      color="white"
                      borderColor="rgba(255,255,255,0.16)"
                      borderRadius="lg"
                      onClick={() => onEdit(user)}
                      _hover={{ bg: "rgba(255,255,255,0.06)", borderColor: "brand.cyan" }}
                    >
                      <IconEdit size={16} />
                    </IconButton>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
