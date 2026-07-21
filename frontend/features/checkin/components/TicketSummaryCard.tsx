"use client";

import { Box, HStack, Stack, Text } from "@chakra-ui/react";
import {
  IconCalendar,
  IconId,
  IconTicket,
  IconUser,
} from "@tabler/icons-react";
import { formatDate } from "@/shared/utils/formats";
import type { TicketSummary as TicketSummaryType } from "../schemas/checkin.schema";
import { StatusBadge } from "./StatusBadge";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
}) {
  return (
    <HStack gap={3} align="center">
      <Box color="brand.cyan">
        <Icon size={20} aria-hidden />
      </Box>

      <Stack gap={0} flex={1} minW={0}>
        <Text
          color="brand.muted"
          fontSize="xs"
          textTransform="uppercase"
          letterSpacing="0.08em"
        >
          {label}
        </Text>

        <Text color="white" fontWeight="medium" fontSize="md" lineClamp={1}>
          {value}
        </Text>
      </Stack>
    </HStack>
  );
}

export function TicketSummaryCard({ ticket }: { ticket: TicketSummaryType }) {
  return (
    <Box
      className="glass-card"
      borderRadius="2xl"
      p={6}
      border="1px solid rgba(255,255,255,0.08)"
      bg="brand.panel"
    >
      <HStack justify="space-between" align="flex-start" mb={5}>
        <Stack gap={1}>
          <Text
            color="brand.cyan"
            fontSize="xs"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.15em"
          >
            Ticket
          </Text>

          <Text color="white" fontSize="xl" fontWeight="bold" lineClamp={1}>
            {ticket.ticketTypeName}
          </Text>
        </Stack>
        <StatusBadge status={ticket.status} />
      </HStack>

      <Stack gap={4}>
        <InfoRow
          icon={IconUser}
          label="Asistente"
          value={ticket.attendeeName}
        />

        <InfoRow
          icon={IconId}
          label="Cédula"
          value={ticket.attendeeCedula ?? "Sin cédula registrada"}
        />

        <InfoRow
          icon={IconTicket}
          label="ID del ticket"
          value={ticket.ticketId}
        />

        {ticket.checkedInAt && (
          <InfoRow
            icon={IconCalendar}
            label="Ingresó"
            value={formatDate(ticket.checkedInAt)}
          />
        )}
      </Stack>
    </Box>
  );
}
