"use client";

import { Box, HStack, Text } from "@chakra-ui/react";
import { IconAlertCircle } from "@tabler/icons-react";
import type { ReactNode } from "react";

export function PaymentsError({ children }: { children: ReactNode }) {
  return (
    <Box
      w="full"
      p={4}
      borderRadius="xl"
      bg="rgba(239,68,68,0.1)"
      border="1px solid rgba(239,68,68,0.3)"
    >
      <HStack gap={3} align="flex-start">
        <IconAlertCircle size={22} color="#ef4444" />
        <Box>
          <Text color="white" fontWeight="bold" fontSize="sm">
            Error
          </Text>
          <Text color="#ef4444" fontSize="sm">
            {children}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
}
