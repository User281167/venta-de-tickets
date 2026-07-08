import { Box } from "@chakra-ui/react";
import { TicketPurchaseClient } from "@/features/ticket-purchase/components/TicketPurchaseClient";

export default function EntradasPage() {
  return (
    <Box maxW="8xl" mx="auto" px={4} py={10}>
      <TicketPurchaseClient />
    </Box>
  );
}
