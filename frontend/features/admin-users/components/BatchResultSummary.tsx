"use client";

import { Box, Button, Flex, Icon, Text, VStack } from "@chakra-ui/react";
import {
  IconCircleCheck,
  IconAlertTriangle,
  IconXboxX,
} from "@tabler/icons-react";

type BatchResult = {
  status: "success" | "conflict" | "error";
  createdCount?: number;
  conflicts?: { emails: string[]; cedulas: string[] };
  errorMessage?: string;
};

type BatchResultSummaryProps = {
  result: BatchResult;
  onReset: () => void;
};

export function BatchResultSummary({
  result,
  onReset,
}: BatchResultSummaryProps) {
  return (
    <Box
      w="full"
      p={6}
      borderRadius="lg"
      borderWidth={1}
      borderColor={
        result.status === "success"
          ? "green.300"
          : result.status === "conflict"
            ? "yellow.300"
            : "red.300"
      }
    >
      <VStack gap={4} align="stretch">
        {result.status === "success" && (
          <Flex align="center" gap={3}>
            <Icon as={IconCircleCheck} boxSize={8} color="white" />

            <Text fontSize="lg" fontWeight="semibold" color="white">
              {result.createdCount} usuario
              {result.createdCount !== 1 ? "s" : ""} creado
              {result.createdCount !== 1 ? "s" : ""} exitosamente
            </Text>
          </Flex>
        )}

        {result.status === "conflict" && (
          <>
            <Flex align="center" gap={3}>
              <Icon as={IconAlertTriangle} boxSize={8} color="white" />

              <Text fontSize="lg" fontWeight="semibold" color="white">
                Conflictos encontrados
              </Text>
            </Flex>

            {result.conflicts?.emails && result.conflicts.emails.length > 0 && (
              <Box>
                <Text fontWeight="medium" color="white">
                  Correos electrónicos en conflicto:
                </Text>

                {result.conflicts.emails.map((email) => (
                  <Text key={email} fontSize="sm" color="white" ml={4}>
                    • {email}
                  </Text>
                ))}
              </Box>
            )}

            {result.conflicts?.cedulas &&
              result.conflicts.cedulas.length > 0 && (
                <Box>
                  <Text fontWeight="medium" color="white">
                    Cédulas en conflicto:
                </Text>

                  {result.conflicts.cedulas.map((cedula) => (
                    <Text key={cedula} fontSize="sm" color="white" ml={4}>
                      • {cedula}
                    </Text>
                  ))}
                </Box>
              )}
          </>
        )}

        {result.status === "error" && (
          <>
            <Flex align="center" gap={3}>
              <Icon as={IconXboxX} boxSize={8} color="white" />

              <Text fontSize="lg" fontWeight="semibold" color="white">
                Error al enviar
              </Text>
            </Flex>

            <Text color="red.600" fontSize="sm">
              {result.errorMessage}
            </Text>
          </>
        )}

        <Flex gap={3} mt={2}>
          {result.status === "error" && (
            <Button colorPalette="red" variant="outline" onClick={onReset}>
              Reintentar
            </Button>
          )}

          <Button colorPalette="teal" onClick={onReset}>
            Volver
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
