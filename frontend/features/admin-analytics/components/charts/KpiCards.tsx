"use client";

import { Box, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

export type KpiItem = {
  label: string;
  value: string;
  hint?: string;
  color?: string;
  icon?: ReactNode;
};

type Props = {
  items: KpiItem[];
};

export function KpiCards({ items }: Props) {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} w="full">
      {items.map((item) => (
        <Box
          key={item.label}
          className="glass-card"
          borderRadius="2xl"
          p={5}
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="3px"
            bg={item.color ?? "#00e5ff"}
            opacity={0.7}
          />
          <VStack align="stretch" gap={2}>
            <HStack gap={2} color="brand.muted">
              {item.icon}
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.1em">
                {item.label}
              </Text>
            </HStack>
            <Text color="white" fontSize="2xl" fontWeight="black" lineHeight="1.1">
              {item.value}
            </Text>
            {item.hint && (
              <Text color="brand.muted" fontSize="xs">
                {item.hint}
              </Text>
            )}
          </VStack>
        </Box>
      ))}
    </SimpleGrid>
  );
}
