"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Spinner,
  Table,
  Text,
  VStack,
  Link as ChakraLink,
  Center,
} from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { useState, useCallback } from "react";
import { usePaymentDetail } from "../api/admin-payments.queries";
import { tableCss } from "@/shared/components/tablecss";
import { RefundDialog } from "./RefundDialog";
import { formatCurrency, formatDate } from "@/shared/utils/formats";
import { PAYMENT_STATUS_LABELS } from "../../../shared/utils/constants";
import { IconExclamationCircleFilled } from "@tabler/icons-react";

export function PaymentDetail() {
  const params = useParams();
  const id = params.id as string;
  const [showRefund, setShowRefund] = useState(false);

  const { data, isLoading, isError } = usePaymentDetail(id);

  const canRefund = data?.status === "completed";

  const handleRefundOpen = useCallback(() => setShowRefund(true), []);

  const handleRefundClose = useCallback(
    (open: boolean) => setShowRefund(open),
    [],
  );

  if (isLoading) {
    return (
      <Center w="full">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (isError || !data) {
    return (
      <Center textAlign="center" py={10} w="full">
        <Flex direction="column" align="center">
          <IconExclamationCircleFilled size={64} color="red" />
          <Text color="red.500">No se pudo cargar el detalle del pago.</Text>
        </Flex>
      </Center>
    );
  }

  return (
    <VStack align="stretch" w="full" spaceY={6}>
      <HStack justify="space-between">
        <Heading as="h1" size="lg" color="brand.dark">
          Detalle del pago
        </Heading>

        <Button bg="blue.400">
          <ChakraLink href="/admin/pagos">Volver a pagos</ChakraLink>
        </Button>
      </HStack>

      <Box p={4} borderRadius="md" spaceY={3}>
        <Heading as="h2" size="sm" color="gray.400">
          Información del pago
        </Heading>

        <HStack wrap="wrap" gap={4}>
          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.500">
              ID
            </Text>

            <Text fontFamily="mono" fontSize="sm">
              {data.id}
            </Text>
          </Box>

          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.500">
              Estado
            </Text>
            <Text>{PAYMENT_STATUS_LABELS[data.status] ?? data.status}</Text>
          </Box>

          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.500">
              Subtotal
            </Text>

            <Text>{formatCurrency(data.subtotalCents)}</Text>
          </Box>

          {data.discountCents > 0 && (
            <Box>
              <Text fontWeight="bold" fontSize="sm" color="gray.500">
                Descuento
              </Text>

              <Text color="green.500">
                -{formatCurrency(data.discountCents)}
              </Text>
            </Box>
          )}

          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.500">
              Total
            </Text>

            <Text>{formatCurrency(data.totalCents)}</Text>
          </Box>

          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.500">
              Proveedor
            </Text>

            <Text>{data.provider}</Text>
          </Box>

          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.500">
              ID Transacción
            </Text>

            <Text fontFamily="mono" fontSize="sm">
              {data.providerTxId ?? "—"}
            </Text>
          </Box>

          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.500">
              Fecha
            </Text>

            <Text>{formatDate(data.createdAt)}</Text>
          </Box>
        </HStack>
      </Box>

      <Box p={4} borderRadius="md" spaceY={3}>
        <Heading as="h2" size="sm" color="gray.400">
          Usuario
        </Heading>

        <Text>{data.user.fullName}</Text>

        <Text fontSize="sm" color="gray.400">
          {data.user.email}
        </Text>
      </Box>

      <Box p={4} borderRadius="md" spaceY={3}>
        <Heading as="h2" size="sm" color="gray.400">
          Tickets comprados
        </Heading>

        <Box w="full" overflow="auto">
          <Table.Root css={tableCss} size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                <Table.ColumnHeader>Precio unit.</Table.ColumnHeader>
                <Table.ColumnHeader>Estado</Table.ColumnHeader>
                <Table.ColumnHeader>Código</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {data.tickets.map((t) => (
                <Table.Row key={t.id}>
                  <Table.Cell>{t.ticketType.name}</Table.Cell>

                  <Table.Cell>
                    {formatCurrency(t.unitPriceCents)}
                  </Table.Cell>

                  <Table.Cell>{t.status}</Table.Cell>

                  <Table.Cell fontFamily="mono" fontSize="xs">
                    {t.ticketCode.slice(0, 12)}...
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>

      {canRefund && (
        <Box textAlign="center" py={4}>
          <Button colorPalette="red" onClick={handleRefundOpen}>
            Reembolsar
          </Button>
        </Box>
      )}

      <RefundDialog
        paymentId={data.id}
        open={showRefund}
        onOpenChange={handleRefundClose}
      />
    </VStack>
  );
}
