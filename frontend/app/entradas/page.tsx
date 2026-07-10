import { TicketSection } from "@/features/landing/components/TicketSection";
import {
  Box,
  Center,
  Container,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";

export default function EntradasPage() {
  return (
    <Box minH="60vh" py={20}>
      <Container maxW="1200px">
        <Center>
          <VStack gap={4} textAlign="center">
            <Text color="brand.muted" maxW="md">
              Compra y venta de boletas no disponible por el momento. Permanezca
              atento a nuestras redes sociales y a esta página para más
              información.
            </Text>

            <TicketSection />
          </VStack>
        </Center>
      </Container>
    </Box>
  );
}
