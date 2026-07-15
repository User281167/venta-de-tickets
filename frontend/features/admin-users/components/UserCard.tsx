"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  IconCash,
  IconEdit,
  IconMail,
  IconPhone,
  IconId,
  IconCalendar,
} from "@tabler/icons-react";
import { motion, useReducedMotion } from "framer-motion";
import type { UserRow } from "../api/admin-users.queries";

interface Props {
  user: UserRow;
  index: number;
  onEdit: (user: UserRow) => void;
  onAddPayment: (user: UserRow) => void;
}

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

export function UserCard({ user, index, onEdit, onAddPayment }: Props) {
  const reduced = useReducedMotion();
  const role = user.role ?? "client";
  const roleColor = ROLE_COLORS[role] ?? ROLE_COLORS.client;
  const roleLabel = ROLE_LABELS[role] ?? role;
  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      style={{ height: "100%" }}
    >
      <Box
        className="glass-card"
        borderRadius="2xl"
        p={5}
        h="full"
        display="flex"
        flexDirection="column"
        position="relative"
        overflow="hidden"
        transition="all 0.25s ease"
        _hover={{
          transform: "translateY(-4px)",
          boxShadow: user.isActive
            ? "0 16px 40px rgba(0,229,255,0.14)"
            : "0 16px 40px rgba(239,68,68,0.1)",
          borderColor: user.isActive ? "brand.cyan" : "red.400",
        }}
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="3px"
          bg={
            user.isActive
              ? `linear-gradient(90deg, ${roleColor}, #00e5ff)`
              : "linear-gradient(90deg, #6b7280, #374151)"
          }
        />

        <HStack justify="space-between" align="flex-start" mb={4}>
          <HStack gap={3}>
            <Flex
              w={12}
              h={12}
              borderRadius="xl"
              bg={`${roleColor}18`}
              border={`1px solid ${roleColor}33`}
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Text color={roleColor} fontWeight="black" fontSize="lg">
                {initials}
              </Text>
            </Flex>

            <Stack gap={0}>
              <Text color="white" fontWeight="bold" fontSize="lg" lineHeight="1.2">
                {user.fullName}
              </Text>
              <HStack gap={2} mt={1}>
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
                <Badge
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  bg={user.isActive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)"}
                  border={user.isActive ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(239,68,68,0.3)"}
                  color={user.isActive ? "#22c55e" : "#ef4444"}
                  fontSize="xs"
                  fontWeight="bold"
                >
                  {user.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </HStack>
            </Stack>
          </HStack>
        </HStack>

        <Stack gap={2} mt="auto" mb={4}>
          <HStack gap={2} color="brand.muted" fontSize="sm">
            <IconMail size={16} color="#00e5ff" />
            <Text>{user.email}</Text>
          </HStack>

          {user.phone && (
            <HStack gap={2} color="brand.muted" fontSize="sm">
              <IconPhone size={16} color="#00e5ff" />
              <Text>{user.phone}</Text>
            </HStack>
          )}

          {user.cedula && (
            <HStack gap={2} color="brand.muted" fontSize="sm">
              <IconId size={16} color="#00e5ff" />
              <Text>{user.cedula}</Text>
            </HStack>
          )}

          <HStack gap={2} color="brand.muted" fontSize="sm">
            <IconCalendar size={16} color="#ff0f7b" />
            <Text>Registrado el {formatDate(user.createdAt)}</Text>
          </HStack>
        </Stack>

        <HStack gap={2} pt={4} borderTop="1px solid rgba(255,255,255,0.08)">
          <Button
            size="sm"
            variant="outline"
            color="white"
            borderColor="rgba(255,255,255,0.16)"
            borderRadius="lg"
            flex={1}
            onClick={() => onAddPayment(user)}
            _hover={{ bg: "rgba(255,255,255,0.06)", borderColor: "brand.cyan" }}
          >
            <IconCash size={16} />
            Pago
          </Button>

          <Button
            size="sm"
            variant="outline"
            color="white"
            borderColor="rgba(255,255,255,0.16)"
            borderRadius="lg"
            flex={1}
            onClick={() => onEdit(user)}
            _hover={{ bg: "rgba(255,255,255,0.06)", borderColor: "brand.cyan" }}
          >
            <IconEdit size={16} />
            Editar
          </Button>
        </HStack>
      </Box>
    </motion.div>
  );
}
