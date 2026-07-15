"use client";

import { Box, Text } from "@chakra-ui/react";
import { formatCurrency } from "@/shared/utils/formats";

interface PaymentTotalSummaryProps {
  total: number;
}

export function PaymentTotalSummary({ total }: PaymentTotalSummaryProps) {
  return (
    <Box
      className="glass-card"
      borderRadius="xl"
      p={4}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      gap={3}
    >
      <Text color="brand.muted" fontSize="sm">
        Total a pagar
      </Text>
      <Text
        color="white"
        fontSize="2xl"
        fontWeight="black"
        className="gradient-text"
      >
        {formatCurrency(Number(total * 100))}
      </Text>
    </Box>
  );
}
