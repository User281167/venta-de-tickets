"use client";

import { Box, HStack, Stack, Text } from "@chakra-ui/react";
import { IconClockHour4 } from "@tabler/icons-react";

interface Props {
  attendeeName: string;
}

export function ConfirmationPendingOverlay({ attendeeName }: Props) {
  return (
    <Box
      position="absolute"
      inset={0}
      bg="rgba(2,4,20,0.78)"
      borderRadius="2xl"
      display="flex"
      alignItems="center"
      justifyContent="center"
      backdropFilter="blur(4px)"
      p={6}
    >
      <Stack gap={3} align="center" textAlign="center" color="white">
        <Box
          color="brand.orange"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <IconClockHour4 size={48} aria-hidden />
        </Box>

        <Text
          color="brand.orange"
          fontWeight="black"
          fontSize="sm"
          textTransform="uppercase"
          letterSpacing="0.15em"
        >
          Esperando confirmación
        </Text>

        <Text fontSize="lg" fontWeight="bold" lineHeight="1.3">
          {attendeeName}
        </Text>

        <Text color="brand.muted" fontSize="sm" maxW="320px">
          Vuelve a escanear cuando el comprador haya confirmado el ingreso desde
          el enlace que le enviamos.
        </Text>

        <HStack
          gap={2}
          mt={2}
          color="brand.muted"
          fontSize="xs"
          textTransform="uppercase"
          letterSpacing="0.1em"
        >
          <Box w="8px" h="8px" borderRadius="full" bg="brand.orange" />

          <Text>Pendiente de confirmación del comprador</Text>
        </HStack>
      </Stack>
    </Box>
  );
}
