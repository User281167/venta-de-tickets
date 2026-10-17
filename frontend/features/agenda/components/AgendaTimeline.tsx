"use client";

import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import { AGENDA_DAYS, getTrackColor } from "../data/agenda";
import { EventCard } from "./AgendaTimelineCard";

export function AgendaTimeline() {
  const reduced = useReducedMotion();
  const day = AGENDA_DAYS[0];

  return (
    <Box
      id="programa"
      as="section"
      py={{ base: 20, md: 28 }}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="-160px"
        right="-160px"
        w="520px"
        h="520px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(20,111,255,0.16) 0%, transparent 70%)"
        pointerEvents="none"
      />
      <Container
        maxW="5xl"
        px={{ base: 4, md: 6 }}
        position="relative"
        zIndex={1}
      >
        <VStack gap={10} align="stretch">
          <Stack gap={4} textAlign="center" mb={4}>
            <Text
              color="#f5bd35"
              fontSize="sm"
              fontWeight="black"
              textTransform="uppercase"
              letterSpacing="0.18em"
            >
              Programa · sábado 24 de octubre
            </Text>
            <Heading
              as="h2"
              fontSize={{ base: "3xl", md: "5xl" }}
              color="white"
              lineHeight="1.1"
            >
              Encuentro, Reactivación y Solidaridad
            </Heading>
            <Text
              color="brand.muted"
              fontSize={{ base: "md", md: "lg" }}
              maxW="680px"
              mx="auto"
            >
              Un evento gratuito para toda la comunidad UTP (Egresados,
              Estudiantes, Docentes, Administrativos, Jubilados y todas sus
              familias) con jornadas para pensar el futuro, generar
              oportunidades, reencontrarnos , impulsar el mañana y apoyar a la
              comunidad universitaria.
            </Text>
          </Stack>

          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Stack gap={3} textAlign="center" mb={4}>
              <Heading as="h3" size="xl" color="white">
                {day.date}
              </Heading>
            </Stack>
          </motion.div>

          <Box position="relative">
            <Box
              position="absolute"
              left={{ base: 5, md: 6 }}
              top={0}
              bottom={0}
              w="2px"
              bg="linear-gradient(to bottom, #f5bd3599, rgba(72,168,255,.12))"
              zIndex={0}
            />
            <VStack
              gap={{ base: 6, md: 8 }}
              align="stretch"
              position="relative"
              zIndex={1}
            >
              {day.events.map((event, idx) => {
                const EventIcon = event.icon;
                const color = getTrackColor(event.track);
                return (
                  <Grid
                    key={`${day.date}-${event.time}-${event.title}`}
                    templateColumns={{
                      base: "48px minmax(0, 1fr)",
                      md: "56px minmax(0, 1fr)",
                    }}
                    gap={{ base: 3, md: 5 }}
                    alignItems="start"
                  >
                    <Flex
                      w={12}
                      h={12}
                      borderRadius="full"
                      bg={color}
                      align="center"
                      justify="center"
                      boxShadow={`0 0 24px ${color}55`}
                      border="3px solid #061126"
                      zIndex={2}
                    >
                      <EventIcon size={21} color="#07152b" />
                    </Flex>
                    <EventCard event={event} index={idx} side="right" />
                  </Grid>
                );
              })}
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
