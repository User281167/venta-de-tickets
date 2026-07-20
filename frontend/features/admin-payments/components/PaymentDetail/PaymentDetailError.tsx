import { Button, Flex, HStack, Text, Center } from "@chakra-ui/react";
import { IconRefresh, IconExclamationCircleFilled } from "@tabler/icons-react";

interface PaymentDetailErrorProps {
  refetch: () => void;
}

export function PaymentDetailError({ refetch }: PaymentDetailErrorProps) {
  return (
    <Center textAlign="center" py={10} w="full" minH="60vh">
      <Flex direction="column" align="center" gap={4}>
        <IconExclamationCircleFilled size={64} color="#ef4444" />
        <Text color="red.400" fontWeight="medium">
          No se pudo cargar el detalle del pago.
        </Text>

        <Button
          variant="outline"
          color="white"
          borderColor="rgba(255,255,255,0.16)"
          borderRadius="xl"
          _hover={{ bg: "rgba(255,255,255,0.06)" }}
          onClick={() => refetch()}
        >
          <HStack gap={2}>
            <IconRefresh size={16} />

            <Text>Reintentar</Text>
          </HStack>
        </Button>
      </Flex>
    </Center>
  );
}
