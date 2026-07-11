"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Input,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";

import {
  useUsers,
  UserRow,
} from "@/features/admin-users/api/admin-users.queries";
import { tableCss } from "@/shared/components/tablecss";

import { TableSkeleton } from "./UserTableSkeleton";
import { ErrorBanner } from "./UserError";
import { UserTableItem } from "./UserTableItem";
import { UserEditDialog } from "./UserEditDialog";
import { UserCreateDialog } from "./UserCreateDialog";

const LIMIT = 20;

export function UserTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError } = useUsers(page, LIMIT, search);
  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;

  return (
    <VStack align="stretch" w="full">
      <Heading as="h1" size="lg" color="brand.light">
        Usuarios
      </Heading>

      <Flex justify="space-between" align="center" w="full" wrap="wrap" gap="2">
        <Input
          flex="1"
          placeholder="Buscar por nombre o correo..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          size="lg"
        />

        <Button
          colorPalette="teal"
          onClick={() => setShowCreate(true)}
        >
          Crear usuario
        </Button>
      </Flex>

      {isError && (
        <ErrorBanner>
          No se pudieron cargar los usuarios. Verifica que tengas permisos de
          administrador.
        </ErrorBanner>
      )}

      {isLoading && <TableSkeleton />}

      {data && (
        <Box mt="4" spaceY="2">
          <Box w="12/12" overflow="auto">
            <Table.Root css={tableCss}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader w="25%">Nombre</Table.ColumnHeader>
                  <Table.ColumnHeader w="30%">Correo</Table.ColumnHeader>
                  <Table.ColumnHeader w="18%">Registro</Table.ColumnHeader>
                  <Table.ColumnHeader w="12%" textAlign="center">
                    Encuesta
                  </Table.ColumnHeader>
                  <Table.ColumnHeader w="15%" textAlign="center">
                    Acciones
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {data.data.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={5}>
                      No se encontraron usuarios
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  data.data.map((user) => (
                    <UserTableItem
                      key={user.id}
                      user={user}
                      onEdit={setEditingUser}
                    />
                  ))
                )}
              </Table.Body>
            </Table.Root>
          </Box>

          <HStack justify="space-between">
            <Text fontSize="sm" color="brand.muted">
              {data.total} usuario(s) — Página {page} de {totalPages}
            </Text>

            <HStack gap={2}>
              <Button
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </HStack>
          </HStack>
        </Box>
      )}

      <UserEditDialog user={editingUser} setUser={setEditingUser} />
      <UserCreateDialog open={showCreate} setOpen={setShowCreate} />
    </VStack>
  );
}
