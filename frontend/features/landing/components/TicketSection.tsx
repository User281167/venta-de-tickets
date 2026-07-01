"use client";

import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
  Center,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { usePublishedEvents } from "@/features/events/api/events.queries";
import { useEventWithTicketTypes } from "@/features/ticket-types/api/ticket-types.queries";
import { TicketTypeCard } from "@/features/ticket-types/components/TicketTypeCard";

export function TicketSection() {
  const { data: events, isLoading: loadingEvents } = usePublishedEvents();
  const firstEventId = events?.[0]?.id ?? "";
  const { data: event, isLoading: loadingEvent } = useEventWithTicketTypes(firstEventId);

  const isLoading = loadingEvents || (!!events?.length && loadingEvent);

  return (
    <Box id="entradas" py={20} bg="gray.50">
      <Container maxW="1200px" px={4}>
        <Stack gap={3} align="center" mb={12}>
          <Heading
            as="h2"
            size={{ base: "2xl", md: "3xl" }}
            color="brand.dark"
            textAlign="center"
          >
            Elige tu entrada
          </Heading>

          <Text color="gray.600" textAlign="center" maxW="lg">
            Selecciona el plan que mejor se adapte a ti y asegura tu lugar en
            Future Minds 2026
          </Text>
        </Stack>

        {isLoading ? (
          <Center py={10}>
            <Spinner size="xl" color="#76ABAE" />
          </Center>
        ) : !event || event.ticketTypes.length === 0 ? (
          <VStack gap={4} align="center" py={10}>
            <Text color="gray.500">
              No hay entradas disponibles en este momento.
            </Text>
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} alignItems="stretch">
            {event.ticketTypes.map((tt) => (
              <TicketTypeCard key={tt.id} ticketType={tt} />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}
