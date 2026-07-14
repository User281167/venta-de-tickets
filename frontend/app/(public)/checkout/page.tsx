"use client"

import { CheckoutPageClient } from "@/features/ticket-purchase/components/CheckoutPageClient";
import { Box } from "@chakra-ui/react";

export default function CheckoutPage() {
  return (
    <Box minH="80vh">
      <CheckoutPageClient />
    </Box>
  );
}
