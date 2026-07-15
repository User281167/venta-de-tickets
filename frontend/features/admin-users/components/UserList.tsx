"use client";

import { Box, Grid, Text } from "@chakra-ui/react";
import { IconUsers } from "@tabler/icons-react";
import type { UserRow } from "../api/admin-users.queries";
import { UserCard } from "./UserCard";

interface Props {
  users: UserRow[];
  onEdit: (user: UserRow) => void;
  onAddPayment: (user: UserRow) => void;
}

export function UserList({ users, onEdit, onAddPayment }: Props) {
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
          <IconUsers size={36} color="#00e5ff" />
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
    <Grid
      templateColumns={{ base: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" }}
      gap={6}
    >
      {users.map((user, index) => (
        <UserCard
          key={user.id}
          user={user}
          index={index}
          onEdit={onEdit}
          onAddPayment={onAddPayment}
        />
      ))}
    </Grid>
  );
}
