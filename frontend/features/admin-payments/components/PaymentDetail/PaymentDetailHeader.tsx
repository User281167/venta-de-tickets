import {
  Button,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { IconArrowLeft } from "@tabler/icons-react";

export function PaymentDetailHeader() {
  return (
    <Flex
      justify="space-between"
      align={{ base: "stretch", md: "center" }}
      gap={4}
      direction={{ base: "column", md: "row" }}
    >
      <VStack align="start" gap={1}>
        <Text
          color="brand.cyan"
          fontSize="sm"
          fontWeight="black"
          textTransform="uppercase"
          letterSpacing="0.15em"
        >
          Administración
        </Text>

        <Heading as="h1" size="2xl" color="white" lineHeight="1.1">
          Detalle del pago
        </Heading>
      </VStack>

      <Button
        asChild
        variant="outline"
        color="white"
        borderColor="rgba(255,255,255,0.16)"
        borderRadius="xl"
        _hover={{ bg: "rgba(255,255,255,0.06)" }}
      >
        <ChakraLink href="/admin/pagos">
          <HStack gap={2}>
            <IconArrowLeft size={18} />
            <Text>Volver a pagos</Text>
          </HStack>
        </ChakraLink>
      </Button>
    </Flex>
  );
}
