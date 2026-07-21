"use client";

import { Badge } from "@chakra-ui/react";
import type { TicketStatus } from "../schemas/checkin.schema";

const STATUS_PALETTE: Record<TicketStatus, string> = {
  paid: "green",
  pending_confirmation: "yellow",
  confirmed: "cyan",
  used: "gray",
  reserved: "orange",
  cancelled: "red",
  expired: "red",
};

const STATUS_LABEL: Record<TicketStatus, string> = {
  paid: "Pagado",
  pending_confirmation: "Pendiente de confirmación",
  confirmed: "Confirmado",
  used: "Usado",
  reserved: "Reservado",
  cancelled: "Cancelado",
  expired: "Expirado",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge
      colorPalette={STATUS_PALETTE[status]}
      size="md"
      px={3}
      py={1}
      borderRadius="full"
      fontWeight="bold"
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}
