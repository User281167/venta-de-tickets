import { Spinner, Text, VStack, Center } from "@chakra-ui/react";

export function PaymentDetailLoading() {
  return (
    <Center w="full" minH="60vh">
      <VStack gap={4}>
        <Spinner size="xl" color="brand.cyan" />

        <Text color="brand.muted" fontSize="sm">
          Cargando detalle del pago...
        </Text>
      </VStack>
    </Center>
  );
}
