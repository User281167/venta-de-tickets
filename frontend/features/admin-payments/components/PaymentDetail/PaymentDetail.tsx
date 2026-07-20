"use client";

import { Box, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { IconUser, IconExclamationCircleFilled } from "@tabler/icons-react";
import { usePaymentDetail } from "../../api/admin-payments.queries";
import { RefundDialog } from "../RefundDialog";
import { canRefund } from "@/shared/utils/constants";
import { PaymentDetailLoading } from "./PaymentDetailLoading";
import { PaymentDetailError } from "./PaymentDetailError";
import { PaymentDetailHeader } from "./PaymentDetailHeader";
import { PaymentDetailInfo } from "./PaymentDetailInfo";
import { cardBase } from "./constants";
import { PaymentDetailTickets } from "./PaymentDetailTickets";

export function PaymentDetail() {
  const params = useParams();
  const id = params.id as string;
  const [showRefund, setShowRefund] = useState(false);
  const reduced = useReducedMotion();

  const { data, isLoading, isError, refetch } = usePaymentDetail(id);

  const isRefundable = data ? canRefund(data.status) : false;
  const isUnfulfillable = data?.status === "completed_unfulfillable";

  const handleRefundOpen = useCallback(() => setShowRefund(true), []);

  const handleRefundClose = useCallback(
    (open: boolean) => setShowRefund(open),
    [],
  );

  if (isLoading) {
    return <PaymentDetailLoading />;
  }

  if (isError || !data) {
    return <PaymentDetailError refetch={refetch} />;
  }

  return (
    <VStack align="stretch" w="full" minW={0} gap={8}>
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PaymentDetailHeader />
      </motion.div>

      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <PaymentDetailInfo data={data} />
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
        <PaymentDetailTickets data={data} />
      </motion.div>

      {isUnfulfillable && (
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <HStack
            gap={3}
            p={4}
            borderRadius="xl"
            bg="rgba(245,158,11,0.08)"
            border="1px solid rgba(245,158,11,0.25)"
            align="start"
          >
            <Box p={2} borderRadius="md" bg="rgba(245,158,11,0.15)">
              <IconExclamationCircleFilled size={20} color="#f59e0b" />
            </Box>
            <VStack align="start" gap={0}>
              <Text color="amber.200" fontWeight="bold" fontSize="sm">
                Pago aprobado sin entradas emitidas
              </Text>

              <Text color="brand.muted" fontSize="sm" lineHeight="1.5">
                El proveedor aprobó el pago pero no había stock suficiente para
                emitir las entradas. Procesa el reembolso manualmente desde el
                botón inferior.
              </Text>
            </VStack>
          </HStack>
        </motion.div>
      )}

      {isRefundable && (
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
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(239,68,68,0.25)",
              }}
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
