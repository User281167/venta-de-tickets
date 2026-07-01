"use client";

import { useState } from "react";
import {
  Box,
  Button,
  HStack,
  Heading,
  Input,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useUsers } from "@/features/admin-users/api/admin-users.queries";

const LIMIT = 20;

export function UserTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isError } = useUsers(page, LIMIT, search);

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <VStack align="stretch" gap={4}>
      <Heading as="h1" size="lg">
        Usuarios
      </Heading>

      <form onSubmit={handleSearch}>
        <HStack gap={2}>
          <Input
            placeholder="Buscar por nombre o correo..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" colorPalette="teal">
            Buscar
          </Button>
        </HStack>
      </form>

      {isLoading && <Text>Cargando...</Text>}

      {isError && (
        <Text color="red.500">
          Error al cargar usuarios. Verifica tus permisos.
        </Text>
      )}

      {data && (
        <>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Nombre</Table.ColumnHeader>
                <Table.ColumnHeader>Correo</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.data.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={2}>
                    No se encontraron usuarios
                  </Table.Cell>
                </Table.Row>
              ) : (
                data.data.map((user) => (
                  <Table.Row key={user.id}>
                    <Table.Cell>{user.fullName}</Table.Cell>
                    <Table.Cell>{user.email}</Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>

          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.500">
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
        </>
      )}
    </VStack>
  );
}
