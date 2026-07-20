"use client";

import {
  Box,
  Flex,
  HStack,
  Separator,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  IconCalendar,
  IconQrcode,
  IconTicket,
} from "@tabler/icons-react";
import type { TicketItem } from "../types/ticket.types";
import { TicketQrExpand } from "./TicketQrExpand";
import { formatDate } from "@/shared/utils/formats";

const STATUS_BG: Record<string, string> = {
  reserved: "#eab308",
  paid: "#22c55e",
  pending_confirmation: "#eab308",
  confirmed: "#0969ff",
  used: "#6b7280",
  cancelled: "#ef4444",
  expired: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  reserved: "Reservada",
  paid: "Pagada",
  pending_confirmation: "Pendiente de confirmación",
  confirmed: "Confirmada",
  used: "Usada",
  cancelled: "Cancelada",
  expired: "Expirada",
};

const statusColor = (status: string) => STATUS_BG[status] ?? "#6b7280";

export function TicketCard({ ticket }: { ticket: TicketItem }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const reduced = useReducedMotion();
  const color = statusColor(ticket.status);
  const statusLabel = STATUS_LABELS[ticket.status] ?? ticket.status;

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ height: "100%" }}
    >
      <Box
        className="glass-card"
        borderRadius="2xl"
        overflow="hidden"
        h="full"
        position="relative"
        transition="all 0.3s ease"
        cursor="pointer"
        onClick={() => setIsExpanded((prev) => !prev)}
        _hover={{
          transform: "translateY(-6px)",
          boxShadow: `0 20px 48px ${color}22`,
          borderColor: color,
        }}
        role="button"
        aria-expanded={isExpanded}
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="4px"
          bg={`linear-gradient(90deg, ${color}, #00e5ff)`}
        />

        <Box p={{ base: 5, md: 6 }}>
          <HStack justify="space-between" align="flex-start" gap={3}>
            <Flex
              w={12}
              h={12}
              borderRadius="xl"
              bg={`${color}18`}
              border={`1px solid ${color}33`}
              align="center"
              justify="center"
              flexShrink={0}
            >
              <IconTicket size={26} color={color} />
            </Flex>

            <Box
              px={3}
              py={1}
              borderRadius="full"
              bg={`${color}18`}
              border={`1px solid ${color}33`}
            >
              <Text fontSize="xs" color={color} fontWeight="bold">
                {statusLabel}
              </Text>
            </Box>
          </HStack>

          <Box mt={5}>
            <Text color="white" fontWeight="bold" fontSize="xl" lineHeight="1.2">
              {ticket.ticketType.name}
            </Text>
            <Text
              fontSize="sm"
              fontFamily="monospace"
              color="brand.muted"
              mt={1}
            >
              {ticket.ticketCode}
            </Text>
          </Box>

          <Separator my={4} borderColor="rgba(255,255,255,0.08)" />

          <HStack gap={2} color="brand.muted" fontSize="sm">
            <IconCalendar size={16} color="#00e5ff" />
            <Text>
              {ticket.purchasedAt
                ? `Comprada el ${formatDate(ticket.purchasedAt)}`
                : `Creada el ${formatDate(ticket.createdAt)}`}
            </Text>
          </HStack>

          <HStack gap={2} mt={4} color="brand.muted" fontSize="sm">
            <IconQrcode size={16} color="#ff0f7b" />
            <Text>
              {isExpanded ? "Toca para ocultar el QR" : "Toca para ver el QR"}
            </Text>
          </HStack>
        </Box>

        <motion.div
          initial={false}
          animate={{
            height: isExpanded ? "auto" : 0,
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: reduced ? 0 : 0.35, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
          onClick={(e) => e.stopPropagation()}
        >
          <Box px={{ base: 5, md: 6 }} pb={{ base: 5, md: 6 }}>
            <Box
              bg="rgba(255,255,255,0.03)"
              borderRadius="xl"
              border="1px solid rgba(255,255,255,0.08)"
              p={4}
            >
              <TicketQrExpand ticket={ticket} />
            </Box>
          </Box>
        </motion.div>
      </Box>
    </motion.div>
  );
}
