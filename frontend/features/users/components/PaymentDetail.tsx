import { Box, Separator, Text, VStack } from "@chakra-ui/react";
import type { PaymentItem } from "../types/payment.types";
import { PAYMENT_STATUS_LABELS } from "@/shared/utils/constants";

export function PaymentDetail({ payment }: { payment: PaymentItem }) {
  return (
    <Box pl={10} pr={4} pb={4}>
      <Separator mb={3} borderColor="gray.600" />
      <VStack align="stretch" gap={2} fontSize="sm">
        <Text color="gray.400">ID de pago: {payment.id}</Text>
        <Text color="gray.400">
          Proveedor: {payment.provider === "mercadopago" ? "Mercado Pago" : payment.provider}
        </Text>
        <Text color="gray.400">
          Fecha: {new Date(payment.createdAt).toLocaleDateString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>

        {payment.tickets.length > 0 && (
          <>
            <Text mt={2} fontWeight="semibold" color="white">
              Entradas ({payment.tickets.length})
            </Text>
            {payment.tickets.map((ticket) => (
              <Box
                key={ticket.id}
                bg="brand.panel"
                p={2}
                borderRadius="md"
              >
                <Text fontSize="xs" fontFamily="monospace">
                  {ticket.ticketCode}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {PAYMENT_STATUS_LABELS[ticket.status] ?? ticket.status}
                </Text>
              </Box>
            ))}
          </>
        )}
      </VStack>
    </Box>
  );
}
