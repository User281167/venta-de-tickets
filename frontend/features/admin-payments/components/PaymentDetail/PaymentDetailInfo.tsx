import {
  Badge,
  Box,
  Grid,
  GridItem,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { IconInfoCircle } from "@tabler/icons-react";
import { formatCurrency, formatDate } from "@/shared/utils/formats";
import {
  PAYMENT_STATUS_LABELS,
  PaymentStatus,
  STATUS_COLORS,
} from "@/shared/utils/constants";
import { PaymentDetailResponse } from "../../schemas/admin-payments.schema";
import { cardBase, labelStyle } from "./constants";

interface PaymentDetailInfoProps {
  data: PaymentDetailResponse;
}

export function PaymentDetailInfo({ data }: PaymentDetailInfoProps) {
  const statusColor = STATUS_COLORS[data.status as PaymentStatus] ?? "#6b7280";
  const statusLabel =
    PAYMENT_STATUS_LABELS[data.status as PaymentStatus] ?? data.status;

  return (
    <Box {...cardBase}>
      <HStack gap={3} mb={5}>
        <Box p={2} borderRadius="xl" bg="rgba(9,105,255,0.12)">
          <IconInfoCircle size={22} color="#0969ff" />
        </Box>

        <Heading as="h2" size="md" color="white">
          Información del pago
        </Heading>
      </HStack>

      <Grid
        templateColumns={{
          base: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={{ base: 4, md: 6 }}
      >
        <GridItem>
          <VStack align="start" gap={1}>
            <Text {...labelStyle}>ID</Text>
            <Text
              fontFamily="mono"
              fontSize="sm"
              color="white"
              wordBreak="break-all"
            >
              {data.id}
            </Text>
          </VStack>
        </GridItem>

        <GridItem>
          <VStack align="start" gap={1}>
            <Text {...labelStyle}>Estado</Text>
            <Badge
              px={2}
              py={0.5}
              borderRadius="full"
              bg={`${statusColor}18`}
              border={`1px solid ${statusColor}33`}
              color={statusColor}
              fontSize="xs"
              fontWeight="bold"
            >
              {statusLabel}
            </Badge>
          </VStack>
        </GridItem>

        <GridItem>
          <VStack align="start" gap={1}>
            <Text {...labelStyle}>Subtotal</Text>
            <Text color="white" fontWeight="semibold">
              {formatCurrency(data.subtotalCents)}
            </Text>
          </VStack>
        </GridItem>

        {data.discountCents > 0 && (
          <GridItem>
            <VStack align="start" gap={1}>
              <Text {...labelStyle}>Descuento</Text>
              <Text color="green.400" fontWeight="semibold">
                -{formatCurrency(data.discountCents)}
              </Text>
            </VStack>
          </GridItem>
        )}

        <GridItem>
          <VStack align="start" gap={1}>
            <Text {...labelStyle}>Total</Text>
            <Text color="white" fontWeight="black" fontSize="lg">
              {formatCurrency(data.totalCents)}
            </Text>
          </VStack>
        </GridItem>

        <GridItem>
          <VStack align="start" gap={1}>
            <Text {...labelStyle}>Proveedor</Text>
            <Text color="white" textTransform="capitalize">
              {data.provider}
            </Text>
          </VStack>
        </GridItem>

        <GridItem>
          <VStack align="start" gap={1}>
            <Text {...labelStyle}>ID Transacción</Text>
            <Text
              fontFamily="mono"
              fontSize="sm"
              color="white"
              wordBreak="break-all"
            >
              {data.providerTxId ?? "—"}
            </Text>
          </VStack>
        </GridItem>

        <GridItem>
          <VStack align="start" gap={1}>
            <Text {...labelStyle}>Fecha</Text>

            <Text color="white">{formatDate(data.createdAt)}</Text>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
}
