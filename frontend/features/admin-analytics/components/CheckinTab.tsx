"use client";

import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import { useCheckinProgress } from "../api/analytics.queries";
import { KpiCards } from "./charts/KpiCards";

export function CheckinTab() {
  const progress = useCheckinProgress();

  const p = progress.data;
  const kpis = [
    {
      label: "Asistieron",
      value: p ? String(p.used) : "—",
      color: "#00d5b8",
    },
    {
      label: "Confirmados sin check-in",
      value: p ? String(p.confirmed) : "—",
      color: "#7c3cff",
    },
    {
      label: "% asistencia",
      value: p ? `${p.usedPercent}%` : "—",
      hint: p
        ? `Sobre ${p.used + p.confirmed} tickets en estado confirmado o usado`
        : undefined,
      color: "#ff0f7b",
    },
  ];

  return (
    <VStack align="stretch" gap={6}>
      <KpiCards items={kpis} />

      <Box className="glass-card" borderRadius="2xl" p={5} w="full">
        <Heading as="h3" size="md" color="white" mb={4} fontWeight="bold">
          Progreso de check-in
        </Heading>
        <Box
          w="full"
          h="20px"
          borderRadius="full"
          bg="rgba(255,255,255,0.06)"
          overflow="hidden"
        >
          <Box
            h="full"
            w={p ? `${p.usedPercent}%` : "0%"}
            bg="linear-gradient(90deg, #00e5ff, #00d5b8)"
            transition="width 0.4s ease"
          />
        </Box>
        <Text color="brand.muted" fontSize="xs" mt={3}>
          Resumen acumulado. Para escanear tickets en vivo, abre{" "}
          <NextLink href="/admin/checkin" style={{ color: "#00e5ff", fontWeight: 700 }}>
            Check-in
          </NextLink>
          .
        </Text>
      </Box>
    </VStack>
  );
}
