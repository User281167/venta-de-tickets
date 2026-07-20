import { Badge, Box, Heading, HStack, Table, Text } from "@chakra-ui/react";
import { IconTicket } from "@tabler/icons-react";
import { tableCss } from "@/shared/components/tablecss";
import { formatCurrency } from "@/shared/utils/formats";
import { PaymentStatus, STATUS_COLORS } from "@/shared/utils/constants";
import { PaymentDetailResponse } from "../../schemas/admin-payments.schema";
import { cardBase } from "./constants";

interface PaymentDetailTicketsProps {
  data: PaymentDetailResponse;
}

export function PaymentDetailTickets({ data }: PaymentDetailTicketsProps) {
  return (
    <Box {...cardBase}>
      <HStack gap={3} mb={5}>
        <Box p={2} borderRadius="xl" bg="rgba(255,15,123,0.12)">
          <IconTicket size={22} color="#ff0f7b" />
        </Box>

        <Heading as="h2" size="md" color="white">
          Tickets comprados
        </Heading>
      </HStack>

      <Box
        w="full"
        minW={0}
        maxW="100%"
        overflowX="auto"
        className="scrollbar-thin"
      >
        <Table.Root css={tableCss} minW="700px" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader w="35%">Tipo</Table.ColumnHeader>
              <Table.ColumnHeader w="20%">Precio unit.</Table.ColumnHeader>
              <Table.ColumnHeader w="20%">Estado</Table.ColumnHeader>
              <Table.ColumnHeader w="25%">Código</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {data.tickets.map((t) => (
              <Table.Row key={t.id}>
                <Table.Cell>
                  <Text color="white" fontWeight="semibold" fontSize="sm">
                    {t.ticketType.name}
                  </Text>
                </Table.Cell>

                <Table.Cell>
                  <Text color="white" fontSize="sm">
                    {formatCurrency(t.unitPriceCents)}
                  </Text>
                </Table.Cell>

                <Table.Cell>
                  <Badge
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    bg={`${STATUS_COLORS[t.status as PaymentStatus] ?? "#6b7280"}18`}
                    border={`1px solid ${STATUS_COLORS[t.status as PaymentStatus] ?? "#6b7280"}33`}
                    color={
                      STATUS_COLORS[t.status as PaymentStatus] ?? "#6b7280"
                    }
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                  >
                    {t.status}
                  </Badge>
                </Table.Cell>

                <Table.Cell fontFamily="mono" fontSize="xs">
                  <Text color="brand.muted">
                    {t.ticketCode.slice(0, 12)}...
                  </Text>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
}
