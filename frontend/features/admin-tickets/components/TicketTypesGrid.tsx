"use client";

import {
  Badge,
  Box,
  Button,
  Grid,
  HStack,
  Progress,
  Stack,
  Text,
} from "@chakra-ui/react";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { motion, useReducedMotion } from "framer-motion";
import type { AdminTicketType } from "@/features/ticket-types/schemas/ticket-types.schema";
import { formatCurrency } from "@/shared/utils/formats";

function TicketTypeCard({
  tt,
  index,
  onEdit,
  onDelete,
}: {
  tt: AdminTicketType;
  index: number;
  onEdit: (tt: AdminTicketType) => void;
  onDelete: (id: string) => void;
}) {
  const reduced = useReducedMotion();
  const available = tt.quantityTotal - tt.quantitySold;
  const progress = tt.quantityTotal > 0
    ? Math.round((tt.quantitySold / tt.quantityTotal) * 100)
    : 0;

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
          boxShadow: tt.isActive
            ? "0 16px 40px rgba(0,229,255,0.14)"
            : "0 16px 40px rgba(239,68,68,0.1)",
          borderColor: tt.isActive ? "brand.cyan" : "red.400",
        }}
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="3px"
          bg={tt.isActive
            ? "linear-gradient(90deg, #ff0f7b, #00e5ff)"
            : "linear-gradient(90deg, #6b7280, #374151)"}
        />

        <HStack justify="space-between" align="flex-start" mb={3}>
          <Stack gap={0}>
            <Text color="white" fontWeight="bold" fontSize="xl">
              {tt.name}
            </Text>
            {tt.description && (
              <Text color="brand.muted" fontSize="sm" lineHeight="1.5" lineClamp={2}>
                {tt.description}
              </Text>
            )}
          </Stack>
          <Badge
            colorPalette={tt.isActive ? "green" : "red"}
            size="sm"
            px={2}
            py={1}
            borderRadius="full"
          >
            {tt.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </HStack>

        <Text color="white" fontSize="2xl" fontWeight="black" className="gradient-text" mb={4}>
          {formatCurrency(Number(tt.price * 100))}
        </Text>

        <Stack gap={3} mt="auto">
          <HStack justify="space-between" fontSize="sm">
            <Text color="brand.muted">Disponibles</Text>
            <Text color="white" fontWeight="medium">
              {available} / {tt.quantityTotal}
            </Text>
          </HStack>

          <Progress.Root value={progress} size="sm" borderRadius="full" colorPalette={tt.isActive ? "cyan" : "gray"}>
            <Progress.Track bg="rgba(255,255,255,0.08)">
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>

          <HStack justify="space-between" fontSize="sm">
            <Text color="brand.muted">Vendidas</Text>
            <Text color="white" fontWeight="medium">
              {tt.quantitySold} ({progress}%)
            </Text>
          </HStack>

          <HStack justify="space-between" fontSize="sm">
            <Text color="brand.muted">Máx. por persona</Text>
            <Text color="white" fontWeight="medium">
              {tt.maxPerUser ?? "Sin límite"}
            </Text>
          </HStack>
        </Stack>

        <HStack gap={2} mt={5} pt={4} borderTop="1px solid rgba(255,255,255,0.08)">
          <Button
            size="sm"
            variant="outline"
            color="white"
            borderColor="rgba(255,255,255,0.16)"
            borderRadius="lg"
            flex={1}
            onClick={() => onEdit(tt)}
            _hover={{ bg: "rgba(255,255,255,0.06)", borderColor: "brand.cyan" }}
          >
            <IconEdit size={16} />
            Editar
          </Button>

          <Button
            size="sm"
            variant="outline"
            colorPalette="red"
            borderRadius="lg"
            flex={1}
            onClick={() => onDelete(tt.id)}
            disabled={!tt.isActive}
            _hover={{ bg: "rgba(239,68,68,0.1)" }}
          >
            <IconTrash size={16} />
            Desactivar
          </Button>
        </HStack>
      </Box>
    </motion.div>
  );
}

export function TicketTypesGrid({
  ticketTypesList,
  setEditing,
  setDeletingId,
}: {
  ticketTypesList: AdminTicketType[];
  setEditing: (value: AdminTicketType | null) => void;
  setDeletingId: (value: string | null) => void;
}) {
  if (ticketTypesList.length === 0) {
    return (
      <Box textAlign="center" py={16}>
        <Text color="white" fontSize="xl" fontWeight="bold" mb={2}>
          No hay tipos de entrada registrados
        </Text>
        <Text color="brand.muted">
          Crea el primero con el botón "Nuevo tipo".
        </Text>
      </Box>
    );
  }

  return (
    <Grid
      templateColumns={{ base: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" }}
      gap={6}
    >
      {ticketTypesList.map((tt, index) => (
        <TicketTypeCard
          key={tt.id}
          tt={tt}
          index={index}
          onEdit={setEditing}
          onDelete={setDeletingId}
        />
      ))}
    </Grid>
  );
}
