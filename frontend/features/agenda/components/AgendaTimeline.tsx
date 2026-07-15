"use client";

import { useState } from "react";
import {
  Badge,
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import { AGENDA_DAYS, type AgendaEvent, getTrackColor } from "../data/agenda";

function EventCard({
  event,
  index,
  side,
}: {
  event: AgendaEvent;
  index: number;
  side: "left" | "right";
}) {
  const reduced = useReducedMotion();
  const trackColor = getTrackColor(event.track);
  const StatusIcon = event.icon;

  return (
    <motion.div
      initial={
        reduced
          ? {}
          : {
              opacity: 0,
              x: side === "left" ? -60 : 60,
            }
      }
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
      style={{ width: "100%" }}
    >
      <Box
        className="glass-card"
        borderRadius="2xl"
        overflow="hidden"
        transition="all 0.3s ease"
        _hover={{
          transform: "translateY(-6px)",
          boxShadow: `0 20px 48px ${trackColor}22`,
          borderColor: trackColor,
        }}
      >
        <Grid
          templateColumns={{ base: "1fr", md: "180px 1fr" }}
          gap={0}
        >
          <Box
            position="relative"
            h={{ base: "180px", md: "full" }}
            minH={{ md: "220px" }}
            overflow="hidden"
          >
            <Image
              src={event.image}
              alt={event.title}
              w="full"
              h="full"
              objectFit="cover"
              transition="transform 0.6s ease"
              _groupHover={{ transform: "scale(1.08)" }}
            />
            <Box
              position="absolute"
              inset={0}
              bg="linear-gradient(to top, rgba(2,4,20,0.7) 0%, transparent 60%)"
            />
            <Badge
              position="absolute"
              bottom={3}
              left={3}
              colorPalette="neutral"
              bg="rgba(2,4,20,0.7)"
              color="white"
              border="1px solid rgba(255,255,255,0.12)"
              px={2.5}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="bold"
              backdropFilter="blur(6px)"
            >
              <HStack gap={1}>
                <StatusIcon size={14} color="#00e5ff" />
                <Text as="span">{event.track}</Text>
              </HStack>
            </Badge>
          </Box>

          <Stack p={{ base: 5, md: 6 }} gap={4} justify="center">
            <HStack gap={3} flexWrap="wrap">
              <Badge
                bg={`${trackColor}18`}
                color={trackColor}
                border={`1px solid ${trackColor}33`}
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
                fontWeight="black"
              >
                {event.time}
              </Badge>
              {event.speakers && event.speakers.length > 0 && (
                <Text color="brand.muted" fontSize="sm">
                  {event.speakers.join(" · ")}
                </Text>
              )}
            </HStack>

            <Heading as="h3" size="lg" color="white" lineHeight="1.2">
              {event.title}
            </Heading>

            <Text color="brand.muted" fontSize="md" lineHeight="1.7">
              {event.description}
            </Text>
          </Stack>
        </Grid>
      </Box>
    </motion.div>
  );
}

export function AgendaTimeline() {
  const [activeDay, setActiveDay] = useState(0);
  const reduced = useReducedMotion();
  const day = AGENDA_DAYS[activeDay];
  const DayIcon = day.icon;

  return (
    <Box as="section" py={{ base: 20, md: 28 }} position="relative" overflow="hidden">
      <Box
        position="absolute"
        top="-160px"
        right="-160px"
        w="520px"
        h="520px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(124,60,255,0.12) 0%, transparent 70%)"
        pointerEvents="none"
      />

      <Container maxW="7xl" px={{ base: 4, md: 6 }} position="relative" zIndex={1}>
        <VStack gap={10} align="stretch">
          <Stack gap={4} textAlign="center" mb={4}>
            <Text
              color="brand.cyan"
              fontSize="sm"
              fontWeight="black"
              textTransform="uppercase"
              letterSpacing="0.15em"
            >
              Programa completo
            </Text>
            <Heading
              as="h2"
              fontSize={{ base: "3xl", md: "5xl" }}
              color="white"
              lineHeight="1.1"
            >
              Explora cada día
            </Heading>
            <Text
              color="brand.muted"
              fontSize={{ base: "md", md: "lg" }}
              maxW="640px"
              mx="auto"
            >
              Selecciona un día para ver la línea de tiempo con actividades,
              ponentes y experiencias.
            </Text>
          </Stack>

          <HStack
            gap={3}
            justify="center"
            flexWrap="wrap"
            position="sticky"
            top={{ base: 14, md: 16 }}
            zIndex={10}
            bg="rgba(2,4,20,0.85)"
            backdropFilter="blur(14px)"
            borderRadius="2xl"
            border="1px solid rgba(255,255,255,0.08)"
            px={4}
            py={4}
          >
            {AGENDA_DAYS.map((d, idx) => {
              const Icon = d.icon;
              const isActive = idx === activeDay;
              return (
                <Box
                  key={d.date}
                  as="button"
                  onClick={() => setActiveDay(idx)}
                  px={5}
                  py={3}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={
                    isActive ? d.color : "rgba(255,255,255,0.1)"
                  }
                  bg={isActive ? `${d.color}14` : "rgba(255,255,255,0.03)"}
                  color={isActive ? "white" : "brand.muted"}
                  transition="all 0.25s ease"
                  _hover={{
                    bg: `${d.color}22`,
                    borderColor: d.color,
                    color: "white",
                  }}
                  cursor="pointer"
                  minW={{ base: "140px", md: "200px" }}
                >
                  <VStack gap={1}>
                    <HStack gap={2}>
                      <Icon size={20} color={isActive ? d.color : "#aeb8d8"} />
                      <Text fontWeight="black" fontSize="sm">
                        {d.weekday}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" opacity={0.8}>
                      {d.date}
                    </Text>
                  </VStack>
                </Box>
              );
            })}
          </HStack>

          <motion.div
            key={day.date}
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Stack gap={3} textAlign="center" mb={8}>
              <HStack gap={3} justify="center">
                <DayIcon size={28} color={day.color} />
                <Heading as="h3" size="xl" color="white">
                  {day.theme}
                </Heading>
              </HStack>
              <Text color="brand.muted" fontSize="md">
                {day.date}
              </Text>
            </Stack>
          </motion.div>

          <Box position="relative">
            <Box
              position="absolute"
              left={{ base: 5, md: "50%" }}
              top={0}
              bottom={0}
              w="2px"
              bg={`linear-gradient(to bottom, ${day.color}66, ${day.color}18)`}
              transform={{ md: "translateX(-50%)" }}
              zIndex={0}
            />

            <VStack gap={{ base: 8, md: 12 }} align="stretch" position="relative" zIndex={1}>
              {day.events.map((event, idx) => {
                const side = idx % 2 === 0 ? "left" : "right";
                const trackColor = getTrackColor(event.track);
                const EventIcon = event.icon;

                return (
                  <Grid
                    key={`${day.date}-${event.time}`}
                    templateColumns={{ base: "auto 1fr", md: "1fr auto 1fr" }}
                    gap={{ base: 4, md: 8 }}
                    alignItems="center"
                  >
                    <Box
                      display={{ base: "none", md: "block" }}
                      order={side === "left" ? 1 : 3}
                    >
                      {side === "left" && (
                        <EventCard event={event} index={idx} side="left" />
                      )}
                    </Box>

                    <Flex
                      order={{ base: 1, md: 2 }}
                      justify="center"
                      position="relative"
                      pl={{ base: 0, md: 0 }}
                    >
                      <motion.div
                        initial={reduced ? {} : { scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.08 }}
                      >
                        <Flex
                          w={12}
                          h={12}
                          borderRadius="full"
                          bg={trackColor}
                          align="center"
                          justify="center"
                          boxShadow={`0 0 24px ${trackColor}55`}
                          border="3px solid #020414"
                          zIndex={2}
                        >
                          <EventIcon size={22} color="white" />
                        </Flex>
                      </motion.div>
                    </Flex>

                    <Box order={{ base: 2, md: side === "left" ? 3 : 1 }}>
                      {side === "right" ? (
                        <EventCard event={event} index={idx} side="right" />
                      ) : (
                        <Box display={{ base: "block", md: "none" }}>
                          <EventCard event={event} index={idx} side="right" />
                        </Box>
                      )}
                    </Box>
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
