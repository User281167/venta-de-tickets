"use client";

import { Box, HStack, Input, Text } from "@chakra-ui/react";
import type { AnalyticsDateRange } from "../schemas/analytics.schema";

type Props = {
  value: AnalyticsDateRange;
  onChange: (next: AnalyticsDateRange) => void;
  onReset: () => void;
};

export function DateRangePicker({ value, onChange, onReset }: Props) {
  return (
    <Box
      className="glass-card"
      borderRadius="xl"
      p={4}
      w="full"
      display="flex"
      alignItems="center"
      gap={4}
      flexWrap="wrap"
    >
      <HStack gap={2}>
        <Text color="brand.muted" fontSize="xs" textTransform="uppercase" letterSpacing="0.1em">
          Desde
        </Text>
        <Input
          type="date"
          size="sm"
          maxW="170px"
          bg="rgba(255,255,255,0.04)"
          border="1px solid rgba(255,255,255,0.1)"
          color="white"
          value={value.from ?? ""}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
        />
      </HStack>
      <HStack gap={2}>
        <Text color="brand.muted" fontSize="xs" textTransform="uppercase" letterSpacing="0.1em">
          Hasta
        </Text>
        <Input
          type="date"
          size="sm"
          maxW="170px"
          bg="rgba(255,255,255,0.04)"
          border="1px solid rgba(255,255,255,0.1)"
          color="white"
          value={value.to ?? ""}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
        />
      </HStack>
      <button
        type="button"
        onClick={onReset}
        style={{
          padding: "6px 12px",
          borderRadius: 6,
          border: "1px solid rgba(0,229,255,0.3)",
          background: "rgba(0,229,255,0.08)",
          color: "#00e5ff",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Últimos 30 días
      </button>
    </Box>
  );
}
