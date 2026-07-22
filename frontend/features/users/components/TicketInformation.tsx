import { Box, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { QRCodeCanvas } from "qrcode.react";
import {
  PaymentStatus,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/shared/utils/payment-status";
import { DetailRow } from "@/features/users/components/DetailRow";
import { TicketItem } from "../types/ticket.types";
import { formatDate } from "@/shared/utils/formats";

interface TicketInformationProps {
  ticket: TicketItem;
}

export function TicketInformation({ ticket }: TicketInformationProps) {
  const statusLabel =
    STATUS_LABELS[ticket.status as PaymentStatus] ?? ticket.status;

  const statusColor =
    STATUS_COLORS[ticket.status as PaymentStatus] ?? "#7a85a8";

  const purchasedAt = ticket.purchasedAt
    ? formatDate(ticket.purchasedAt)
    : null;

  return (
    <Box minH="80vh" px={4} py={8} maxW="640px" mx="auto">
      <VStack
        align="stretch"
        gap={5}
        bg="brand.panel"
        borderRadius="2xl"
        p={{ base: 6, md: 8 }}
        border="1px solid"
        borderColor="rgba(255,255,255,0.08)"
        boxShadow="0 24px 80px rgba(0,0,0,0.5)"
      >
        <VStack align="stretch" gap={1}>
          <NextLink
            href="/mi-cuenta/entradas"
            style={{
              color: "#aeb8d8",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            <HStack gap={1}>
              <IconArrowLeft size={14} />
              <Text>Volver a mis entradas</Text>
            </HStack>
          </NextLink>

          <Heading as="h1" size="xl" color="white">
            {ticket.ticketType.name}
          </Heading>
        </VStack>

        <HStack>
          <Box
            px={3}
            py={1}
            borderRadius="full"
            bg={`${statusColor}20`}
            border={`1px solid ${statusColor}50`}
          >
            <Text
              color={statusColor}
              fontSize="xs"
              fontWeight="bold"
              letterSpacing="1px"
              textTransform="uppercase"
            >
              {statusLabel}
            </Text>
          </Box>
        </HStack>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="white"
          borderRadius="xl"
          p={6}
        >
          {ticket.qrToken ? (
            <QRCodeCanvas value={ticket.qrToken} size={220} level="M" />
          ) : (
            <Text color="black" fontSize="sm">
              QR no disponible
            </Text>
          )}
        </Box>

        <VStack
          align="stretch"
          gap={2}
          p={4}
          borderRadius="xl"
          bg="rgba(255,255,255,0.03)"
          border="1px solid rgba(255,255,255,0.06)"
        >
          <DetailRow label="ID del ticket" value={ticket.id} mono />

          <DetailRow label="Código" value={ticket.ticketCode} mono />

          {purchasedAt && <DetailRow label="Comprada" value={purchasedAt} />}
        </VStack>
      </VStack>
    </Box>
  );
}
