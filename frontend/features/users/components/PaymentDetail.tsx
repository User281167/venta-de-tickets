import {
  Box,
  Grid,
  HStack,
  Separator,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  IconCreditCard,
  IconExclamationCircleFilled,
  IconId,
  IconReceipt,
  IconTicket,
} from "@tabler/icons-react";
import type { PaymentItem } from "../types/payment.types";
import { PAYMENT_STATUS_LABELS, PaymentStatus } from "@/shared/utils/constants";
import { formatCurrency, formatDate } from "@/shared/utils/formats";

export function PaymentDetail({ payment }: { payment: PaymentItem }) {
  const isUnfulfillable = payment.status === "completed_unfulfillable";

  return (
    <Box
      px={{ base: 5, md: 6 }}
      pb={{ base: 5, md: 6 }}
      pl={{ base: 5, md: 7 }}
    >
      <Separator mb={5} borderColor="rgba(255,255,255,0.08)" />

      {isUnfulfillable && (
        <HStack
          gap={3}
          p={4}
          borderRadius="xl"
          bg="rgba(245,158,11,0.08)"
          border="1px solid rgba(245,158,11,0.25)"
          align="start"
          mb={5}
        >
          <Box p={2} borderRadius="md" bg="rgba(245,158,11,0.15)">
            <IconExclamationCircleFilled size={20} color="#f59e0b" />
          </Box>

          <VStack align="start" gap={0}>
            <Text color="amber.200" fontWeight="bold" fontSize="sm">
              Pago aprobado sin entradas emitidas
            </Text>

            <Text color="brand.muted" fontSize="sm" lineHeight="1.5">
              Tu pago fue aprobado por el proveedor, pero no fue posible emitir
              tus entradas. Nuestro equipo se pondrá en contacto contigo para
              coordinar el reembolso.
            </Text>
          </VStack>
        </HStack>
      )}

      <Grid
        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
        gap={4}
        mb={payment.tickets.length > 0 ? 5 : 0}
      >
        <HStack gap={3}>
          <Box color="brand.cyan">
            <IconId size={20} />
          </Box>

          <Stack gap={0}>
            <Text fontSize="xs" color="brand.muted">
              ID de pago
            </Text>

            <Text color="white" fontSize="sm" fontFamily="monospace">
              {payment.id}
            </Text>
          </Stack>
        </HStack>

        <HStack gap={3}>
          <Box color="brand.cyan">
            <IconCreditCard size={20} />
          </Box>

          <Stack gap={0}>
            <Text fontSize="xs" color="brand.muted">
              Proveedor
            </Text>

            <Text color="white" fontSize="sm">
              {payment.provider === "mercadopago"
                ? "Mercado Pago"
                : payment.provider}
            </Text>
          </Stack>
        </HStack>

        <HStack gap={3}>
          <Box color="brand.cyan">
            <IconReceipt size={20} />
          </Box>

          <Stack gap={0}>
            <Text fontSize="xs" color="brand.muted">
              Fecha y hora
            </Text>

            <Text color="white" fontSize="sm">
              {formatDate(payment.createdAt)}
            </Text>
          </Stack>
        </HStack>

        <HStack gap={3}>
          <Box color="brand.cyan">
            <IconReceipt size={20} />
          </Box>

          <Stack gap={0}>
            <Text fontSize="xs" color="brand.muted">
              Estado
            </Text>

            <Text color="white" fontSize="sm">
              {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
            </Text>
          </Stack>
        </HStack>
      </Grid>

      {payment.tickets.length > 0 && (
        <>
          <HStack gap={2} mb={3} color="white" fontWeight="bold">
            <IconTicket size={18} color="#ff0f7b" />
            <Text>Entradas incluidas</Text>
          </HStack>

          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={3}>
            {payment.tickets.map((ticket) => (
              <Box
                key={ticket.id}
                bg="rgba(255,255,255,0.03)"
                border="1px solid rgba(255,255,255,0.08)"
                p={3}
                borderRadius="xl"
              >
                <Text fontSize="xs" color="brand.muted">
                  Código
                </Text>

                <Text fontSize="sm" fontFamily="monospace" color="white">
                  {ticket.ticketCode}
                </Text>

                <Text fontSize="xs" color="brand.muted" mt={1}>
                  {PAYMENT_STATUS_LABELS[ticket.status as PaymentStatus] ??
                    ticket.status}
                </Text>
              </Box>
            ))}
          </Grid>
        </>
      )}

      <HStack
        justify="space-between"
        mt={5}
        pt={4}
        borderTop="1px solid rgba(255,255,255,0.08)"
        flexWrap="wrap"
        gap={3}
      >
        <Text fontSize="sm" color="brand.muted">
          Subtotal: {formatCurrency(payment.subtotalCents)}
        </Text>

        {payment.discountCents > 0 && (
          <Text fontSize="sm" color="brand.muted">
            Descuento: -{formatCurrency(payment.discountCents)}
          </Text>
        )}

        <Text fontSize="lg" fontWeight="black" color="white">
          Total: {formatCurrency(payment.totalCents)}
        </Text>
      </HStack>
    </Box>
  );
}
