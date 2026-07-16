"use client";

import { Badge, Box, HStack, IconButton, Text } from "@chakra-ui/react";
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

const GRID_COLS =
  "minmax(180px, 1.5fr) minmax(220px, 2fr) 110px 110px 130px 120px";

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
      w="full"
      minW={0}
      maxW="100%"
      overflowX="auto"
      borderRadius="2xl"
      border="1px solid rgba(255,255,255,0.08)"
      bg="brand.panel"
      className="scrollbar-thin"
    >
      <Box minW="900px" w="full" role="grid">
        <Box
          role="row"
          display="grid"
          gridTemplateColumns={GRID_COLS}
          bg="rgba(0,0,0,0.3)"
          borderBottom="1px solid rgba(255,255,255,0.08)"
          px={4}
          py={3}
        >
          <Text role="columnheader" color="white" fontWeight="bold" fontSize="sm">
            Nombre
          </Text>
          <Text role="columnheader" color="white" fontWeight="bold" fontSize="sm">
            Correo
          </Text>
          <Text role="columnheader" color="white" fontWeight="bold" fontSize="sm">
            Rol
          </Text>
          <Text role="columnheader" color="white" fontWeight="bold" fontSize="sm">
            Estado
          </Text>
          <Text role="columnheader" color="white" fontWeight="bold" fontSize="sm">
            Registro
          </Text>
          <Text
            role="columnheader"
            color="white"
            fontWeight="bold"
            fontSize="sm"
            textAlign="center"
          >
            Acciones
          </Text>
        </Box>

        {users.map((user) => {
          const role = user.role ?? "client";
          const roleColor = ROLE_COLORS[role] ?? ROLE_COLORS.client;
          const roleLabel = ROLE_LABELS[role] ?? role;

          return (
            <Box
              key={user.id}
              role="row"
              display="grid"
              gridTemplateColumns={GRID_COLS}
              alignItems="center"
              px={4}
              py={3}
              borderBottom="1px solid rgba(255,255,255,0.06)"
              transition="background 0.2s ease"
              _hover={{ bg: "rgba(255,255,255,0.03)" }}
            >
              <Text color="white" fontWeight="bold" fontSize="sm">
                {user.fullName}
              </Text>
              <Text color="brand.muted" fontSize="sm">
                {user.email}
              </Text>
              <Box>
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
              </Box>
              <Box>
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
              </Box>
              <Text color="brand.muted" fontSize="sm">
                {formatDate(user.createdAt)}
              </Text>
              <HStack justify="center" gap={2}>
                <IconButton
                  aria-label="Registrar pago"
                  size="sm"
                  variant="outline"
                  color="white"
                  borderColor="rgba(255,255,255,0.16)"
                  borderRadius="lg"
                  onClick={() => onAddPayment(user)}
                  _hover={{
                    bg: "rgba(255,255,255,0.06)",
                    borderColor: "brand.cyan",
                  }}
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
                  _hover={{
                    bg: "rgba(255,255,255,0.06)",
                    borderColor: "brand.cyan",
                  }}
                >
                  <IconEdit size={16} />
                </IconButton>
              </HStack>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
