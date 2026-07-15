"use client";

import {
  Box,
  Collapsible,
  Flex,
  Grid,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import {
  IconCalendar,
  IconCreditCard,
  IconChevronDown,
  IconTicket,
} from "@tabler/icons-react";
import type { PaymentItem } from "../types/payment.types";
import { PaymentDetail } from "./PaymentDetail";
import { formatCurrency } from "@/shared/utils/formats";
import { PAYMENT_STATUS_LABELS } from "@/shared/utils/constants";

const STATUS_BG: Record<string, string> = {
  pending: "#eab308",
  completed: "#22c55e",
  failed: "#ef4444",
  refunded: "#6b7280",
};

const STATUS_LABELS = PAYMENT_STATUS_LABELS;

function ProviderIcon({ provider }: { provider: string }) {
  return (
    <Flex
      w={10}
      h={10}
      borderRadius="xl"
      bg="rgba(255,255,255,0.05)"
      border="1px solid rgba(255,255,255,0.08)"
      align="center"
      justify="center"
    >
      <IconCreditCard size={20} color="#00e5ff" />
    </Flex>
  );
}

export function PaymentRow({ payment }: { payment: PaymentItem }) {
  const reduced = useReducedMotion();
  const color = STATUS_BG[payment.status] ?? "#6b7280";
  const statusLabel = STATUS_LABELS[payment.status] ?? payment.status;
  const providerLabel =
    payment.provider === "mercadopago" ? "Mercado Pago" : payment.provider;

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Collapsible.Root>
        <Box
          className="glass-card"
          borderRadius="2xl"
          overflow="hidden"
          position="relative"
          transition="all 0.3s ease"
          _hover={{
            transform: "translateY(-4px)",
            boxShadow: `0 16px 40px ${color}1a`,
            borderColor: color,
          }}
        >
          <Box
            position="absolute"
            left={0}
            top={0}
            bottom={0}
            w="4px"
            bg={`linear-gradient(to bottom, ${color}, #00e5ff)`}
          />

          <Collapsible.Trigger cursor="pointer" w="full">
            <Box p={{ base: 5, md: 6 }} pl={{ base: 5, md: 7 }}>
              <Grid
                templateColumns={{ base: "1fr", md: "1fr auto auto" }}
                gap={{ base: 4, md: 6 }}
                alignItems="center"
              >
                <Stack gap={3}>
                  <HStack gap={4}>
                    <ProviderIcon provider={payment.provider} />
                    <Stack gap={0}>
                      <Text color="white" fontWeight="bold" fontSize="lg">
                        {providerLabel}
                      </Text>
                      <HStack gap={2} color="brand.muted" fontSize="sm">
                        <IconCalendar size={14} />
                        <Text>
                          {new Date(payment.createdAt).toLocaleDateString("es-CO", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Text>
                      </HStack>
                    </Stack>
                  </HStack>
                </Stack>

                <HStack gap={4} justify={{ base: "space-between", md: "flex-end" }}>
                  <Box textAlign={{ base: "left", md: "right" }}>
                    <Text fontSize="xs" color="brand.muted">
                      Total
                    </Text>
                    <Text color="white" fontWeight="black" fontSize="xl">
                      {formatCurrency(payment.totalCents)}
                    </Text>
                  </Box>

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

                <Box display={{ base: "none", md: "block" }}>
                  <IconChevronDown size={22} color="#aeb8d8" />
                </Box>
              </Grid>

              <HStack gap={2} mt={4} color="brand.muted" fontSize="sm">
                <IconTicket size={16} color="#ff0f7b" />
                <Text>
                  {payment.tickets.length}{" "}
                  {payment.tickets.length === 1 ? "entrada asociada" : "entradas asociadas"}
                </Text>
              </HStack>
            </Box>
          </Collapsible.Trigger>

          <Collapsible.Content>
            <PaymentDetail payment={payment} />
          </Collapsible.Content>
        </Box>
      </Collapsible.Root>
    </motion.div>
  );
}
