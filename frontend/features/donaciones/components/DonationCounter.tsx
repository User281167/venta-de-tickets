"use client";

import { HStack, Stack, Text } from "@chakra-ui/react";
import { IconChartBar } from "@tabler/icons-react";
import { useDonationCounter } from "../api/donation-counter.queries";
import { formatCurrency } from "@/shared/utils/formats";

export function DonationCounter() {
  const { data, isLoading, isError } = useDonationCounter();

  if (isLoading) {
    return (
      <Stack
        gap={2}
        bg="rgba(2,4,20,0.55)"
        borderRadius="xl"
        border="1px solid rgba(255,255,255,0.08)"
        p={6}
        w="full"
        maxW="md"
      >
        <Text color="brand.muted" fontSize="sm">
          Cargando contador...
        </Text>
      </Stack>
    );
  }

  if (isError || !data) {
    return null;
  }

  const percent =
    data.metaValue > 0
      ? Math.min(100, Math.round((data.currentValue / data.metaValue) * 100))
      : 0;

  return (
    <Stack
      gap={3}
      bg="rgba(2,4,20,0.55)"
      borderRadius="xl"
      border="1px solid rgba(255,255,255,0.08)"
      p={6}
      w="full"
      maxW="md"
      backdropFilter="blur(6px)"
    >
      <HStack gap={2} color="white">
        <IconChartBar size={20} color="#00e5ff" />
        <Text fontWeight="bold" fontSize="sm" textTransform="uppercase" letterSpacing="0.12em">
          Recaudado
        </Text>
      </HStack>

      <Text fontSize="3xl" fontWeight="black" color="white" lineHeight="1.1">
        {formatCurrency(data.currentValue)}
      </Text>

      {data.metaValue > 0 && (
        <Text fontSize="sm" color="brand.muted">
          Meta: {formatCurrency(data.metaValue)} ({percent}%)
        </Text>
      )}

      {data.metaValue > 0 && (
        <Stack
          h="6px"
          w="full"
          bg="rgba(255,255,255,0.08)"
          borderRadius="full"
          overflow="hidden"
        >
          <Stack
            h="full"
            w={`${percent}%`}
            style={{
              background:
                "linear-gradient(90deg, #ff0f7b 0%, #00e5ff 100%)",
            }}
          />
        </Stack>
      )}
    </Stack>
  );
}
