"use client";

import {
  Box,
  Center,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
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
  const { data: event, isLoading: loadingEvent } =
    useEventWithTicketTypes(firstEventId);
  const isLoading = loadingEvents || (!!events?.length && loadingEvent);

  return (
    <Box
      id="entradas"
      py={{ base: 14, md: 20 }}
      bg="linear-gradient(180deg, #020414 0%, #050719 48%, #020414 100%)"
    >
      <Container maxW="1200px" px={{ base: 4, md: 6 }}>
        <Stack gap={3} align="center" textAlign="center" mb={10}>
          <Text
            color="brand.cyan"
            fontSize="xs"
            fontWeight="black"
            textTransform="uppercase"
          >
            Inscripción
          </Text>
          <Heading color="white" fontSize={{ base: "3xl", md: "4xl" }}>
            Asegura tu cupo en La U del Futuro
          </Heading>
          <Text color="brand.muted">
            Cupos limitados para actividades académicas y culturales.
          </Text>
        </Stack>

        {isLoading ? (
          <Center py={10}>
            <Spinner size="xl" color="brand.cyan" />
          </Center>
        ) : !event || event.ticketTypes.length === 0 ? (
          <VStack gap={4} align="center" py={10}>
            <Text color="brand.muted">
              No hay entradas disponibles en este momento.
            </Text>
          </VStack>
        ) : (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            gap={6}
            alignItems="stretch"
          >
            {event.ticketTypes.map((tt) => (
              <TicketTypeCard key={tt.id} ticketType={tt} />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}
