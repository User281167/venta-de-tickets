"use client";

import {
  Box,
  Center,
  Container,
  Heading,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useActiveTicketTypes } from "@/features/ticket-purchase/api/ticket-purchase.queries";
import { TicketTypeCard } from "@/features/ticket-types/components/TicketTypeCard";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/shared/components/AnimatedSection";

export function TicketSection() {
  const { data: ticketTypes, isLoading } = useActiveTicketTypes();

  return (
    <Box
      id="entradas"
      py={{ base: 16, md: 24 }}
      bg="linear-gradient(180deg, #020414 0%, #050719 48%, #020414 100%)"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="-120px"
        left="50%"
        transform="translateX(-50%)"
        w="600px"
        h="600px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(255,15,123,0.12) 0%, transparent 70%)"
        pointerEvents="none"
      />

      <Container maxW="1200px" px={{ base: 4, md: 6 }} position="relative" zIndex={1}>
        <AnimatedSection direction="up" delay={0} duration={0.6}>
          <Stack gap={4} align="center" textAlign="center" mb={14}>
          <Text
            color="brand.pink"
            fontSize="sm"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.15em"
          >
            Inscripción abierta
          </Text>

          <Heading
            color="white"
            fontSize={{ base: "3xl", md: "5xl" }}
            lineHeight="1.1"
            maxW="700px"
          >
            Asegura tu cupo para la convención
          </Heading>

          <Text color="brand.muted" fontSize={{ base: "md", md: "lg" }} maxW="600px">
            Cupos limitados para actividades académicas, culturales y de networking.
            Elige la entrada que mejor se ajuste a ti.
          </Text>
        </Stack>
        </AnimatedSection>

        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height="260px" borderRadius="xl" />
            ))}
          </SimpleGrid>
        ) : !ticketTypes || ticketTypes.length === 0 ? (
          <VStack
            gap={4}
            align="center"
            py={16}
            px={6}
            borderRadius="xl"
            className="glass-card"
          >
            <Text color="white" fontSize="xl" fontWeight="bold">
              No hay entradas disponibles en este momento
            </Text>
            <Text color="brand.muted" textAlign="center" maxW="500px">
              Vuelve pronto o contáctanos para más información sobre próximas actividades.
            </Text>
          </VStack>
        ) : (
          <AnimatedSection direction="up" delay={0} duration={0.6}>
            <StaggerContainer>
              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3 }}
                gap={6}
                alignItems="stretch"
              >
                {ticketTypes.map((tt) => (
                  <StaggerItem key={tt.id}>
                    <Box
                      transition="transform 0.25s ease, box-shadow 0.25s ease"
                      _hover={{
                        transform: "translateY(-6px)",
                      }}
                    >
                      <TicketTypeCard ticketType={tt} />
                    </Box>
                  </StaggerItem>
                ))}
              </SimpleGrid>
            </StaggerContainer>
          </AnimatedSection>
        )}
      </Container>
    </Box>
  );
}
