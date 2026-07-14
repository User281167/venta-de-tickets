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
import { formatCurrency } from "@/shared/utils/formats";
import { PAYMENT_STATUS_LABELS } from "@/shared/utils/constants";

const STATUS_BG: Record<string, string> = {
  pending: "yellow.500",
  completed: "green.500",
  failed: "red.500",
  refunded: "gray.500",
};

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
              {formatCurrency(payment.totalCents)}
            </Text>

            <Box
              px={2}
              py={0.5}
              borderRadius="full"
              bg={STATUS_BG[payment.status] ?? "gray.500"}
            >
              <Text fontSize="xs" color="white" fontWeight="medium">
                {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
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
