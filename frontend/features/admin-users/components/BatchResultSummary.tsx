"use client";

import { Box, Button, Flex, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import {
  IconCircleCheck,
  IconAlertTriangle,
  IconXboxX,
  IconRotate,
  IconArrowLeft,
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

const STATUS_CONFIG = {
  success: {
    icon: IconCircleCheck,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
    title: "Carga completada",
  },
  conflict: {
    icon: IconAlertTriangle,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    title: "Conflictos encontrados",
  },
  error: {
    icon: IconXboxX,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
    title: "Error al enviar",
  },
};

export function BatchResultSummary({
  result,
  onReset,
}: BatchResultSummaryProps) {
  const config = STATUS_CONFIG[result.status];
  const IconComponent = config.icon;

  return (
    <Box
      w="full"
      className="glass-card"
      borderRadius="2xl"
      p={{ base: 5, md: 6 }}
      border="1px solid"
      borderColor={config.border}
      bg={config.bg}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="3px"
        bg={`linear-gradient(90deg, ${config.color}, #00e5ff)`}
      />

      <VStack gap={5} align="stretch" position="relative">
        <Flex align="center" gap={4}>
          <Flex
            w={14}
            h={14}
            borderRadius="xl"
            bg={`${config.color}18`}
            border={`1px solid ${config.color}33`}
            align="center"
            justify="center"
            flexShrink={0}
          >
            <Icon as={IconComponent} boxSize={7} color={config.color} />
          </Flex>

          <Box>
            <Text color="white" fontSize="xl" fontWeight="bold">
              {config.title}
            </Text>
            {result.status === "success" && (
              <Text color="brand.muted" fontSize="sm">
                {result.createdCount} usuario
                {result.createdCount !== 1 ? "s" : ""} creado
                {result.createdCount !== 1 ? "s" : ""} exitosamente
              </Text>
            )}
          </Box>
        </Flex>

        {result.status === "conflict" && (
          <VStack align="stretch" gap={4}>
            {result.conflicts?.emails && result.conflicts.emails.length > 0 && (
              <Box
                className="glass-card"
                borderRadius="xl"
                p={4}
              >
                <Text color="white" fontWeight="bold" mb={2}>
                  Correos electrónicos en conflicto
                </Text>
                {result.conflicts.emails.map((email) => (
                  <Text key={email} fontSize="sm" color="brand.muted" ml={1}>
                    • {email}
                  </Text>
                ))}
              </Box>
            )}

            {result.conflicts?.cedulas &&
              result.conflicts.cedulas.length > 0 && (
                <Box
                  className="glass-card"
                  borderRadius="xl"
                  p={4}
                >
                  <Text color="white" fontWeight="bold" mb={2}>
                    Cédulas en conflicto
                  </Text>
                  {result.conflicts.cedulas.map((cedula) => (
                    <Text key={cedula} fontSize="sm" color="brand.muted" ml={1}>
                      • {cedula}
                    </Text>
                  ))}
                </Box>
              )}
          </VStack>
        )}

        {result.status === "error" && (
          <Box
            className="glass-card"
            borderRadius="xl"
            p={4}
          >
            <Text color="#ef4444" fontWeight="medium">
              {result.errorMessage}
            </Text>
          </Box>
        )}

        <HStack gap={3} mt={2} flexWrap="wrap">
          {result.status === "error" && (
            <Button
              variant="outline"
              color="white"
              borderColor="rgba(255,255,255,0.16)"
              borderRadius="xl"
              onClick={onReset}
              _hover={{ bg: "rgba(255,255,255,0.06)" }}
            >
              <HStack gap={2}>
                <IconRotate size={18} />
                <Text>Reintentar</Text>
              </HStack>
            </Button>
          )}

          <Button
            bg="brand.violet"
            color="white"
            fontWeight="bold"
            borderRadius="xl"
            onClick={onReset}
            _hover={{ bg: "#6a2be2", transform: "translateY(-2px)" }}
            transition="all 0.2s ease"
          >
            <HStack gap={2}>
              <IconArrowLeft size={18} />
              <Text>Volver</Text>
            </HStack>
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
