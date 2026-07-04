"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Badge,
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

import { useUsers } from "@/features/admin-users/api/admin-users.queries";

import { TableSkeleton } from "./UserTableSkeleton";
import { tableCss } from "@/shared/components/tablecss";

const LIMIT = 20;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <Flex
      bg="red.50"
      border="1px"
      borderColor="red.200"
      borderRadius="md"
      p={4}
      gap={3}
      align="center"
    >
      <Box w="3" h="3" borderRadius="full" bg="red.400" flexShrink={0} />
      <Text color="red.700" fontSize="sm">
        {children}
      </Text>
    </Flex>
  );
}

export function UserTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

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

      <Input
        placeholder="Buscar por nombre o correo..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        size="lg"
      />

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
                  <Table.ColumnHeader w="30%">Nombre</Table.ColumnHeader>
                  <Table.ColumnHeader w="35%">Correo</Table.ColumnHeader>
                  <Table.ColumnHeader w="20%">Registro</Table.ColumnHeader>
                  <Table.ColumnHeader w="15%" textAlign="center">
                    Encuesta
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {data.data.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={4}>
                      No se encontraron usuarios
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  data.data.map((user) => (
                    <Table.Row key={user.id}>
                      <Table.Cell>{user.fullName}</Table.Cell>
                      <Table.Cell>{user.email}</Table.Cell>
                      <Table.Cell>{formatDate(user.createdAt)}</Table.Cell>

                      <Table.Cell textAlign="center">
                        <Badge
                          colorPalette={
                            user.onboardingSurveyDone ? "green" : "yellow"
                          }
                          size="sm"
                        >
                          {user.onboardingSurveyDone ? "Completa" : "Pendiente"}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
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
    </VStack>
  );
}
