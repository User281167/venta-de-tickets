"use client";

import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { Footer } from "@/components/layout/Footer";
import { AgendaTimeline } from "@/features/agenda/components/AgendaTimeline";
import { Navbar } from "@/components/layout/Navbar";

export default function AgendaPage() {
  return (
    <>
      <Navbar />

      <main>
        <Box bg="brand.dark" color="brand.light">
          <Box py={10} position="relative">
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              height="300px"
              bgGradient="linear(to b, colors.brand.dark 0%, colors.brand.panel 100%)"
              opacity="0.7"
            />
            <Container>
              <VStack gap={8} align="stretch">
                <Heading as="h1" size="xl" color="brand.light">
                  Agenda de La Convención
                </Heading>

                <Text color="brand.muted" fontSize="md">
                  22, 23 y 24 de Octubre 2026 — Tres días de innovación,
                  emprendimiento y tecnología.
                </Text>
              </VStack>
            </Container>
          </Box>

          <AgendaTimeline />
        </Box>
      </main>

      <Footer />
    </>
  );
}
