"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
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
import { motion, useReducedMotion } from "framer-motion";
import { IconArrowLeft, IconTicket, IconUser, IconInfoCircle, IconRefresh } from "@tabler/icons-react";
import { usePaymentDetail } from "../api/admin-payments.queries";
import { tableCss } from "@/shared/components/tablecss";
import { RefundDialog } from "./RefundDialog";
import { formatCurrency, formatDate } from "@/shared/utils/formats";
import { PAYMENT_STATUS_LABELS } from "@/shared/utils/constants";
import { IconExclamationCircleFilled } from "@tabler/icons-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "#eab308",
  completed: "#22c55e",
  failed: "#ef4444",
  refunded: "#6b7280",
};

const cardBase = {
  bg: "brand.panel",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "2xl",
  p: { base: 4, md: 6 },
};

const labelStyle = {
  fontSize: "xs",
  fontWeight: "black",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "brand.muted",
} as const;

export function PaymentDetail() {
  const params = useParams();
  const id = params.id as string;
  const [showRefund, setShowRefund] = useState(false);
  const reduced = useReducedMotion();

  const { data, isLoading, isError, refetch } = usePaymentDetail(id);

  const canRefund = data?.status === "completed";

  const handleRefundOpen = useCallback(() => setShowRefund(true), []);

  const handleRefundClose = useCallback(
    (open: boolean) => setShowRefund(open),
    [],
  );

  if (isLoading) {
    return (
      <Center w="full" minH="60vh">
        <VStack gap={4}>
          <Spinner size="xl" color="brand.cyan" />
          <Text color="brand.muted" fontSize="sm">
            Cargando detalle del pago...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (isError || !data) {
    return (
      <Center textAlign="center" py={10} w="full" minH="60vh">
        <Flex direction="column" align="center" gap={4}>
          <IconExclamationCircleFilled size={64} color="#ef4444" />
          <Text color="red.400" fontWeight="medium">
            No se pudo cargar el detalle del pago.
          </Text>
          <Button
            variant="outline"
            color="white"
            borderColor="rgba(255,255,255,0.16)"
            borderRadius="xl"
            _hover={{ bg: "rgba(255,255,255,0.06)" }}
            onClick={() => refetch()}
          >
            <HStack gap={2}>
              <IconRefresh size={16} />
              <Text>Reintentar</Text>
            </HStack>
          </Button>
        </Flex>
      </Center>
    );
  }

  const statusColor = STATUS_COLORS[data.status] ?? "#6b7280";
  const statusLabel = PAYMENT_STATUS_LABELS[data.status] ?? data.status;

  return (
    <VStack align="stretch" w="full" minW={0} gap={8}>
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Flex
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          gap={4}
          direction={{ base: "column", md: "row" }}
        >
          <VStack align="start" gap={1}>
            <Text
              color="brand.cyan"
              fontSize="sm"
              fontWeight="black"
              textTransform="uppercase"
              letterSpacing="0.15em"
            >
              Administración
            </Text>
            <Heading as="h1" size="2xl" color="white" lineHeight="1.1">
              Detalle del pago
            </Heading>
          </VStack>

          <Button
            asChild
            variant="outline"
            color="white"
            borderColor="rgba(255,255,255,0.16)"
            borderRadius="xl"
            _hover={{ bg: "rgba(255,255,255,0.06)" }}
          >
            <ChakraLink href="/admin/pagos">
              <HStack gap={2}>
                <IconArrowLeft size={18} />
                <Text>Volver a pagos</Text>
              </HStack>
            </ChakraLink>
          </Button>
        </Flex>
      </motion.div>

      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Box {...cardBase}>
          <HStack gap={3} mb={5}>
            <Box p={2} borderRadius="xl" bg="rgba(9,105,255,0.12)">
              <IconInfoCircle size={22} color="#0969ff" />
            </Box>
            <Heading as="h2" size="md" color="white">
              Información del pago
            </Heading>
          </HStack>

          <Grid
            templateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            }}
            gap={{ base: 4, md: 6 }}
          >
            <GridItem>
              <VStack align="start" gap={1}>
                <Text {...labelStyle}>ID</Text>
                <Text fontFamily="mono" fontSize="sm" color="white" wordBreak="break-all">
                  {data.id}
                </Text>
              </VStack>
            </GridItem>

            <GridItem>
              <VStack align="start" gap={1}>
                <Text {...labelStyle}>Estado</Text>
                <Badge
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  bg={`${statusColor}18`}
                  border={`1px solid ${statusColor}33`}
                  color={statusColor}
                  fontSize="xs"
                  fontWeight="bold"
                >
                  {statusLabel}
                </Badge>
              </VStack>
            </GridItem>

            <GridItem>
              <VStack align="start" gap={1}>
                <Text {...labelStyle}>Subtotal</Text>
                <Text color="white" fontWeight="semibold">
                  {formatCurrency(data.subtotalCents)}
                </Text>
              </VStack>
            </GridItem>

            {data.discountCents > 0 && (
              <GridItem>
                <VStack align="start" gap={1}>
                  <Text {...labelStyle}>Descuento</Text>
                  <Text color="green.400" fontWeight="semibold">
                    -{formatCurrency(data.discountCents)}
                  </Text>
                </VStack>
              </GridItem>
            )}

            <GridItem>
              <VStack align="start" gap={1}>
                <Text {...labelStyle}>Total</Text>
                <Text color="white" fontWeight="black" fontSize="lg">
                  {formatCurrency(data.totalCents)}
                </Text>
              </VStack>
            </GridItem>

            <GridItem>
              <VStack align="start" gap={1}>
                <Text {...labelStyle}>Proveedor</Text>
                <Text color="white" textTransform="capitalize">
                  {data.provider}
                </Text>
              </VStack>
            </GridItem>

            <GridItem>
              <VStack align="start" gap={1}>
                <Text {...labelStyle}>ID Transacción</Text>
                <Text fontFamily="mono" fontSize="sm" color="white" wordBreak="break-all">
                  {data.providerTxId ?? "—"}
                </Text>
              </VStack>
            </GridItem>

            <GridItem>
              <VStack align="start" gap={1}>
                <Text {...labelStyle}>Fecha</Text>
                <Text color="white">{formatDate(data.createdAt)}</Text>
              </VStack>
            </GridItem>
          </Grid>
        </Box>
      </motion.div>

      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Box {...cardBase}>
          <HStack gap={3} mb={4}>
            <Box p={2} borderRadius="xl" bg="rgba(0,229,255,0.12)">
              <IconUser size={22} color="#00e5ff" />
            </Box>
            <Heading as="h2" size="md" color="white">
              Usuario
            </Heading>
          </HStack>

          <VStack align="start" gap={1}>
            <Text color="white" fontWeight="bold" fontSize="lg">
              {data.user.fullName}
            </Text>
            <Text fontSize="sm" color="brand.muted">
              {data.user.email}
            </Text>
          </VStack>
        </Box>
      </motion.div>

      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Box {...cardBase}>
          <HStack gap={3} mb={5}>
            <Box p={2} borderRadius="xl" bg="rgba(255,15,123,0.12)">
              <IconTicket size={22} color="#ff0f7b" />
            </Box>
            <Heading as="h2" size="md" color="white">
              Tickets comprados
            </Heading>
          </HStack>

          <Box w="full" minW={0} maxW="100%" overflowX="auto" className="scrollbar-thin">
            <Table.Root css={tableCss} minW="700px" size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader w="35%">Tipo</Table.ColumnHeader>
                  <Table.ColumnHeader w="20%">Precio unit.</Table.ColumnHeader>
                  <Table.ColumnHeader w="20%">Estado</Table.ColumnHeader>
                  <Table.ColumnHeader w="25%">Código</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {data.tickets.map((t) => (
                  <Table.Row key={t.id}>
                    <Table.Cell>
                      <Text color="white" fontWeight="semibold" fontSize="sm">
                        {t.ticketType.name}
                      </Text>
                    </Table.Cell>

                    <Table.Cell>
                      <Text color="white" fontSize="sm">
                        {formatCurrency(t.unitPriceCents)}
                      </Text>
                    </Table.Cell>

                    <Table.Cell>
                      <Badge
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        bg={`${STATUS_COLORS[t.status] ?? "#6b7280"}18`}
                        border={`1px solid ${STATUS_COLORS[t.status] ?? "#6b7280"}33`}
                        color={STATUS_COLORS[t.status] ?? "#6b7280"}
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                      >
                        {t.status}
                      </Badge>
                    </Table.Cell>

                    <Table.Cell fontFamily="mono" fontSize="xs">
                      <Text color="brand.muted">{t.ticketCode.slice(0, 12)}...</Text>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Box>
      </motion.div>

      {canRefund && (
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Box textAlign="center" py={2}>
            <Button
              colorPalette="red"
              size="lg"
              borderRadius="xl"
              px={8}
              onClick={handleRefundOpen}
              _hover={{ transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(239,68,68,0.25)" }}
              transition="all 0.2s ease"
            >
              Reembolsar pago
            </Button>
          </Box>
        </motion.div>
      )}

      <RefundDialog
        paymentId={data.id}
        open={showRefund}
        onOpenChange={handleRefundClose}
      />
    </VStack>
  );
}
