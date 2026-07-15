"use client";

import { Box, Container, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { IconCalendar, IconMapPin } from "@tabler/icons-react";
import { motion, useReducedMotion } from "framer-motion";

export function AgendaHero() {
  const reduced = useReducedMotion();

  return (
    <Box position="relative" overflow="hidden">
      <Box
        position="absolute"
        inset={0}
        bg="linear-gradient(135deg, rgba(2,4,20,0.92) 0%, rgba(7,10,34,0.82) 50%, rgba(2,4,20,0.95) 100%)"
        zIndex={1}
      />
      <Box
        position="absolute"
        inset={0}
        backgroundImage="url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80')"
        backgroundSize="cover"
        backgroundPosition="center"
        transform="scale(1.05)"
        className="animate-slow-zoom"
        zIndex={0}
      />

      <Box
        position="absolute"
        bottom="-120px"
        left="-120px"
        w="420px"
        h="420px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(255,15,123,0.22) 0%, transparent 70%)"
        pointerEvents="none"
        zIndex={2}
      />
      <Box
        position="absolute"
        top="-80px"
        right="-80px"
        w="360px"
        h="360px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(0,229,255,0.18) 0%, transparent 70%)"
        pointerEvents="none"
        zIndex={2}
      />

      <Container
        maxW="7xl"
        px={{ base: 4, md: 6 }}
        position="relative"
        zIndex={3}
        py={{ base: 24, md: 32 }}
      >
        <Stack gap={6} align="center" textAlign="center">
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Text
              color="brand.cyan"
              fontSize="sm"
              fontWeight="black"
              textTransform="uppercase"
              letterSpacing="0.2em"
            >
              22 — 24 de Octubre 2026
            </Text>
          </motion.div>

          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <Heading
              as="h1"
              fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
              lineHeight="1.05"
              color="white"
            >
              Agenda de{" "}
              <Box as="span" className="gradient-text">
                La Convención
              </Box>
            </Heading>
          </motion.div>

          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Text
              color="brand.muted"
              fontSize={{ base: "md", md: "xl" }}
              maxW="720px"
              lineHeight="1.7"
            >
              Tres días de conferencias, talleres, networking y demostraciones
              con los líderes que están transformando el futuro de Colombia.
            </Text>
          </motion.div>

          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <HStack
              gap={{ base: 4, md: 8 }}
              justify="center"
              flexWrap="wrap"
              pt={4}
            >
              <HStack gap={2} color="brand.muted">
                <IconCalendar size={22} color="#00e5ff" />
                <Text fontSize="md" fontWeight="medium">
                  22, 23 y 24 de Octubre
                </Text>
              </HStack>
              <HStack gap={2} color="brand.muted">
                <IconMapPin size={22} color="#ff0f7b" />
                <Text fontSize="md" fontWeight="medium">
                  Centro de Convenciones UTP
                </Text>
              </HStack>
            </HStack>
          </motion.div>
        </Stack>
      </Container>
    </Box>
  );
}
