import { TicketPurchaseClient } from "@/features/ticket-purchase/components/TicketPurchaseClient";
import { Box, Container, VStack } from "@chakra-ui/react";

export default function EntradasPage() {
  return (
    <Box minH="60vh">
      <Container maxW="8xl">
        <VStack gap={4} textAlign="center">
          <TicketPurchaseClient />
        </VStack>
      </Container>
    </Box>
  );
}
