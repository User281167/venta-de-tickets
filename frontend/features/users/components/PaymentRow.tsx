"use client";

import {
  Box,
  Collapsible,
  Flex,
  HStack,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import type { PaymentItem } from "../types/payment.types";
import { PaymentDetail } from "./PaymentDetail";

const STATUS_BG: Record<string, string> = {
  pending: "yellow.500",
  completed: "green.500",
  failed: "red.500",
  refunded: "gray.500",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  completed: "Pagado",
  failed: "Fallido",
  refunded: "Reembolsado",
};

function formatCOP(cents: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function PaymentRow({ payment }: { payment: PaymentItem }) {
  return (
    <Collapsible.Root>
      <Collapsible.Trigger cursor="pointer" w="full">
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap="4"
          p="4"
          bg="brand.panel"
          borderRadius="md"
          _hover={{ bg: "brand.panelHover" }}
          transition="background 0.15s"
        >
          <HStack gap={4}>
            <Text color="white" fontWeight="medium" minW="24">
              {new Date(payment.createdAt).toLocaleDateString("es-CO")}
            </Text>

            <Text color="gray.300" fontSize="sm">
              {payment.provider === "mercadopago"
                ? "Mercado Pago"
                : payment.provider}
            </Text>
          </HStack>

          <SimpleGrid columns={2} gap={4} templateColumns="1fr 1fr" w="52">
            <Text color="white" fontWeight="semibold">
              {formatCOP(payment.amountCents)}
            </Text>

            <Box
              px={2}
              py={0.5}
              borderRadius="full"
              bg={STATUS_BG[payment.status] ?? "gray.500"}
            >
              <Text fontSize="xs" color="white" fontWeight="medium">
                {STATUS_LABELS[payment.status] ?? payment.status}
              </Text>
            </Box>
          </SimpleGrid>
        </Flex>
      </Collapsible.Trigger>

      <Collapsible.Content>
        <PaymentDetail payment={payment} />
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
