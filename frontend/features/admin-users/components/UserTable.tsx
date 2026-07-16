"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  HStack,
  Heading,
  IconButton,
  Input,
  InputGroup,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  IconLayoutGrid,
  IconPlus,
  IconSearch,
  IconTable,
} from "@tabler/icons-react";
import { motion, useReducedMotion } from "framer-motion";

import {
  useUsers,
  UserRow,
} from "@/features/admin-users/api/admin-users.queries";

import { TableSkeleton } from "./UserTableSkeleton";
import { ErrorBanner } from "./UserError";
import { UserList } from "./UserList";
import { UserTableView } from "./UserTableView";
import { UserStats } from "./UserStats";
import { UserEditDialog } from "./UserEditDialog";
import { UserCreateDialog } from "./UserCreateDialog";
import { AddPaymentDialog } from "./AddPaymentDialog";

const LIMIT = 20;
const VIEW_STORAGE_KEY = "admin-users-view";

type ViewMode = "cards" | "table";

function getInitialView(): ViewMode {
  if (typeof window === "undefined") return "cards";
  try {
    const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
    return stored === "table" ? "table" : "cards";
  } catch {
    return "cards";
  }
}

export function UserTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [paymentUser, setPaymentUser] = useState<UserRow | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [view, setView] = useState<ViewMode>("cards");
  const reduced = useReducedMotion();

  useEffect(() => {
    setView(getInitialView());
  }, []);

  const handleViewChange = (next: ViewMode) => {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
  };

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
    <VStack align="stretch" w="full" minW={0} gap={8}>
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          gap={4}
        >
          <Box>
            <Text
              color="brand.cyan"
              fontSize="sm"
              fontWeight="black"
              textTransform="uppercase"
              letterSpacing="0.15em"
            >
              Gestión de usuarios
            </Text>
            <Heading as="h1" size="2xl" color="white" lineHeight="1.1">
              Usuarios
            </Heading>
          </Box>

          <Button
            bg="brand.violet"
            color="white"
            fontWeight="bold"
            borderRadius="xl"
            px={6}
            size="lg"
            _hover={{ bg: "#6a2be2", transform: "translateY(-2px)" }}
            transition="all 0.2s ease"
            onClick={() => setShowCreate(true)}
          >
            <IconPlus size={20} />
            Crear usuario
          </Button>
        </Stack>
      </motion.div>

      <Stack
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        gap={4}
      >
        <InputGroup
          maxW="md"
          startElement={<IconSearch size={18} color="#aeb8d8" />}
        >
          <Input
            placeholder="Buscar por nombre o correo..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="lg"
            bg="rgba(255,255,255,0.03)"
            border="1px solid rgba(255,255,255,0.08)"
            borderRadius="xl"
            color="white"
            _placeholder={{ color: "brand.muted" }}
            _hover={{ borderColor: "rgba(255,255,255,0.16)" }}
            _focus={{
              borderColor: "brand.cyan",
              boxShadow: "0 0 12px rgba(0,229,255,0.2)",
            }}
          />
        </InputGroup>

        <HStack gap={2}>
          <IconButton
            aria-label="Vista de tarjetas"
            size="lg"
            variant="outline"
            borderRadius="xl"
            color={view === "cards" ? "brand.dark" : "white"}
            bg={view === "cards" ? "white" : "transparent"}
            borderColor="rgba(255,255,255,0.16)"
            onClick={() => handleViewChange("cards")}
            _hover={{
              bg: view === "cards" ? "brand.light" : "rgba(255,255,255,0.06)",
            }}
          >
            <IconLayoutGrid size={20} />
          </IconButton>
          <IconButton
            aria-label="Vista de tabla"
            size="lg"
            variant="outline"
            borderRadius="xl"
            color={view === "table" ? "brand.dark" : "white"}
            bg={view === "table" ? "white" : "transparent"}
            borderColor="rgba(255,255,255,0.16)"
            onClick={() => handleViewChange("table")}
            _hover={{
              bg: view === "table" ? "brand.light" : "rgba(255,255,255,0.06)",
            }}
          >
            <IconTable size={20} />
          </IconButton>
        </HStack>
      </Stack>

      {isError && (
        <ErrorBanner>
          No se pudieron cargar los usuarios. Verifica que tengas permisos de
          administrador.
        </ErrorBanner>
      )}

      {isLoading && <TableSkeleton />}

      {data && (
        <VStack align="stretch" gap={8}>
          <UserStats users={data.data} />

          {view === "cards" ? (
            <UserList
              users={data.data}
              onEdit={setEditingUser}
              onAddPayment={setPaymentUser}
            />
          ) : (
            <UserTableView
              users={data.data}
              onEdit={setEditingUser}
              onAddPayment={setPaymentUser}
            />
          )}

          <HStack justify="space-between" flexWrap="wrap" gap={4}>
            <Text fontSize="sm" color="brand.muted">
              {data.total} usuario(s) — Página {page} de {totalPages}
            </Text>

            <HStack gap={2}>
              <Button
                size="sm"
                variant="outline"
                color="white"
                borderColor="rgba(255,255,255,0.16)"
                borderRadius="xl"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                color="white"
                borderColor="rgba(255,255,255,0.16)"
                borderRadius="xl"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </HStack>
          </HStack>
        </VStack>
      )}

      <UserEditDialog user={editingUser} setUser={setEditingUser} />
      <AddPaymentDialog user={paymentUser} setUser={setPaymentUser} />
      <UserCreateDialog open={showCreate} setOpen={setShowCreate} />
    </VStack>
  );
}
